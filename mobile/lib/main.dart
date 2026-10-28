import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'services/api_service.dart';
import 'services/classifier_service.dart';
import 'services/legal_registry_service.dart';
import 'services/location_service.dart';
import 'services/profile_service.dart';
import 'services/sync_service.dart';
import 'screens/main_scaffold.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF0C1912),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Core Services
  final apiService = ApiService(baseUrl: 'https://sundarban-sentinel-gateway.sundarban-sentinel.workers.dev');
  final classifierService = ClassifierService();
  final syncService = SyncService(api: apiService);
  final locationService = LocationService();

  // Initialize offline storage, edge models, legal intelligence & profile vault
  await syncService.initialize();
  await classifierService.initialize();
  await LegalRegistryService.initialize();
  await ProfileService().initialize();

  runApp(
    SundarbanSentinelApp(
      apiService: apiService,
      classifierService: classifierService,
      syncService: syncService,
      locationService: locationService,
    ),
  );
}

class SundarbanSentinelApp extends StatelessWidget {
  final ApiService apiService;
  final ClassifierService classifierService;
  final SyncService syncService;
  final LocationService locationService;

  const SundarbanSentinelApp({
    super.key,
    required this.apiService,
    required this.classifierService,
    required this.syncService,
    required this.locationService,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sundarban Sentinel',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF08120D),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00E676),
          secondary: Color(0xFF00E5FF),
          surface: Color(0xFF11231B),
          error: Color(0xFFFF5252),
          onPrimary: Colors.black,
          onSurface: Colors.white,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0E2218),
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.0,
            color: Colors.white,
          ),
        ),
      ),
      home: MainScaffold(
        apiService: apiService,
        classifierService: classifierService,
        syncService: syncService,
        locationService: locationService,
      ),
    );
  }
}
