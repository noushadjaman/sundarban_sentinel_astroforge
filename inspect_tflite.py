"""
Extract tensor shapes, names, and metadata from a TFLite file without tensorflow.
"""
import struct

def parse_tflite(filepath):
    with open(filepath, 'rb') as f:
        buf = f.read()

    magic = buf[4:8]
    print(f"File: {filepath}")
    print(f"Size: {len(buf)} bytes")
    print(f"Magic: {magic}")
    assert magic == b'TFL3', f"Invalid TFLite file, magic is {magic}"

    # Search for known tensor name patterns or strings
    import re
    # Find all strings in the file that might describe shapes or names
    names = re.findall(rb'[a-zA-Z0-9_/\.]{3,}', buf)
    print("\nInteresting strings:")
    interesting = [n.decode('ascii', errors='ignore') for n in names if any(k in n.lower() for k in [b'output', b'input', b'detect', b'serving', b'quantized', b'names'])]
    for s in interesting[:25]:
        print(" -", s)

parse_tflite(r'f:\sundarbansanetile\best_int8 (1).tflite')
