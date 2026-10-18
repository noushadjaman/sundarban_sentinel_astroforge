export 'classifier_service_stub.dart'
    if (dart.library.io) 'classifier_service_io.dart'
    if (dart.library.js_interop) 'classifier_service_web.dart'
    if (dart.library.html) 'classifier_service_web.dart';
