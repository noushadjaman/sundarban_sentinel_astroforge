import struct

with open(r'f:\sundarbansanetile\best_int8 (1).tflite', 'rb') as f:
    buf = f.read()

def read_table(offset):
    vtable_offset = offset - struct.unpack('<i', buf[offset:offset+4])[0]
    vtable_len = struct.unpack('<H', buf[vtable_offset:vtable_offset+2])[0]
    return vtable_offset, vtable_len

def get_field(offset, field_idx):
    vt_off, vt_len = read_table(offset)
    field_offset_loc = vt_off + 4 + field_idx * 2
    if field_offset_loc + 2 > vt_off + vt_len:
        return None
    field_off = struct.unpack('<H', buf[field_offset_loc:field_offset_loc+2])[0]
    if field_off == 0:
        return None
    return offset + field_off

def get_vector(field_loc):
    vec_loc = field_loc + struct.unpack('<I', buf[field_loc:field_loc+4])[0]
    vec_len = struct.unpack('<I', buf[vec_loc:vec_loc+4])[0]
    return vec_loc + 4, vec_len

def get_string(field_loc):
    str_loc = field_loc + struct.unpack('<I', buf[field_loc:field_loc+4])[0]
    str_len = struct.unpack('<I', buf[str_loc:str_loc+4])[0]
    return buf[str_loc+4:str_loc+4+str_len].decode('utf-8', errors='ignore')

root_offset = struct.unpack('<I', buf[0:4])[0]

# Model schema: field 0=version, field 1=operator_codes, field 2=subgraphs
subgraphs_field = get_field(root_offset, 2)
if subgraphs_field:
    sg_vec, sg_len = get_vector(subgraphs_field)
    for sg_i in range(sg_len):
        sg_off = sg_vec + sg_i * 4
        sg_loc = sg_off + struct.unpack('<I', buf[sg_off:sg_off+4])[0]
        # In SubGraph: 0=tensors, 1=inputs, 2=outputs
        tensors_field = get_field(sg_loc, 0)
        inputs_field = get_field(sg_loc, 1)
        outputs_field = get_field(sg_loc, 2)
        
        in_vec, in_len = get_vector(inputs_field)
        inputs = [struct.unpack('<i', buf[in_vec+i*4:in_vec+i*4+4])[0] for i in range(in_len)]
        
        out_vec, out_len = get_vector(outputs_field)
        outputs = [struct.unpack('<i', buf[out_vec+i*4:out_vec+i*4+4])[0] for i in range(out_len)]
        
        t_vec, t_len = get_vector(tensors_field)
        
        # TensorType: 0=FLOAT32, 1=FLOAT16, 2=INT32, 3=UINT8, 9=INT8
        type_names = {0: 'FLOAT32', 1: 'FLOAT16', 2: 'INT32', 3: 'UINT8', 9: 'INT8'}
        
        for idx in inputs + outputs:
            t_loc = t_vec + idx * 4
            t_table = t_loc + struct.unpack('<I', buf[t_loc:t_loc+4])[0]
            name_f = get_field(t_table, 3)
            name = get_string(name_f) if name_f else f'tensor_{idx}'
            
            shape_f = get_field(t_table, 0)
            shape = []
            if shape_f:
                s_vec, s_len = get_vector(shape_f)
                shape = [struct.unpack('<i', buf[s_vec+k*4:s_vec+k*4+4])[0] for k in range(s_len)]
            
            type_f = get_field(t_table, 1)
            type_val = struct.unpack('<b', buf[type_f:type_f+1])[0] if type_f else None
            role = 'INPUT' if idx in inputs else 'OUTPUT'
            print(f'{role} Tensor {idx}: Name="{name}", Shape={shape}, Type={type_names.get(type_val, type_val)}')
