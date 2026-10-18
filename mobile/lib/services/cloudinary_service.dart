import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;

class CloudinaryService {
  final String cloudName;
  final String uploadPreset;

  CloudinaryService({
    this.cloudName = 'dsnb5jiht',
    this.uploadPreset = 'sundarban_santinel',
  });

  /// Uploads binary image bytes or file to Cloudinary CDN
  Future<String> uploadImageBytes({
    required Uint8List bytes,
    String filename = 'incident_capture.jpg',
  }) async {
    final uri = Uri.parse('https://api.cloudinary.com/v1_1/$cloudName/image/upload');
    final request = http.MultipartRequest('POST', uri);

    request.fields['upload_preset'] = uploadPreset;
    request.files.add(
      http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: filename,
      ),
    );

    final streamedResponse = await request.send().timeout(const Duration(seconds: 40));
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final secureUrl = data['secure_url']?.toString() ?? data['url']?.toString() ?? '';
      if (secureUrl.isNotEmpty) {
        return secureUrl;
      }
      throw Exception('Cloudinary response missing secure_url: ${response.body}');
    } else {
      throw Exception('Cloudinary upload failed (${response.statusCode}): ${response.body}');
    }
  }

  /// Uploads an image file from local storage path
  Future<String> uploadImageFile(String filePath) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('Local image file does not exist at: $filePath');
    }
    final bytes = await file.readAsBytes();
    final filename = filePath.split(Platform.pathSeparator).last;
    return uploadImageBytes(bytes: bytes, filename: filename);
  }
}
