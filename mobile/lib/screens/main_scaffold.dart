import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/classifier_service.dart';
import '../services/location_service.dart';
import '../services/sync_service.dart';
import '../widgets/offline_mode_dialog.dart';
import 'ranger_map_screen.dart';
import 'edge_scanner_screen.dart';
import 'reports_screen.dart';
import 'analytics_screen.dart';
import 'profile_screen.dart';

class MainScaffold extends StatefulWidget {
  final ApiService apiService;
  final ClassifierService classifierService;
  final SyncService syncService;
  final LocationService locationService;

  const MainScaffold({
    super.key,
    required this.apiService,
    required this.classifierService,
    required this.syncService,
    required this.locationService,
  });

  static void switchToTab(BuildContext context, int tabIndex) {
    final state = context.findAncestorStateOfType<_MainScaffoldState>();
    state?.setTab(tabIndex);
  }

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;
  late final List<Widget> _screens;
  bool _previousOnlineStatus = true;
  bool _hasCheckedInitialStatus = false;

  void setTab(int tabIndex) {
    if (tabIndex >= 0 && tabIndex < _screens.length) {
      setState(() => _currentIndex = tabIndex);
    }
  }

  @override
  void initState() {
    super.initState();
    _screens = [
      RangerMapScreen(
        apiService: widget.apiService,
        locationService: widget.locationService,
        syncService: widget.syncService,
      ),
      EdgeScannerScreen(
        classifierService: widget.classifierService,
        syncService: widget.syncService,
        locationService: widget.locationService,
      ),
      ReportsScreen(
        syncService: widget.syncService,
      ),
      AnalyticsScreen(
        apiService: widget.apiService,
        syncService: widget.syncService,
      ),
      ProfileScreen(
        syncService: widget.syncService,
      ),
    ];

    _previousOnlineStatus = widget.syncService.isOnlineNotifier.value;
    widget.syncService.isOnlineNotifier.addListener(_onConnectivityChanged);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (!widget.syncService.isOnlineNotifier.value && !_hasCheckedInitialStatus) {
        _hasCheckedInitialStatus = true;
        OfflineModeDialog.show(context);
      }
    });
  }

  void _onConnectivityChanged() {
    final isOnline = widget.syncService.isOnlineNotifier.value;
    if (_previousOnlineStatus && !isOnline) {
      // Transition from online to offline
      if (mounted) {
        OfflineModeDialog.show(context);
      }
    }
    _previousOnlineStatus = isOnline;
  }

  @override
  void dispose() {
    widget.syncService.isOnlineNotifier.removeListener(_onConnectivityChanged);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0C1912),
          border: Border(top: BorderSide(color: Color(0xFF1B3527), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: const Color(0xFF0C1912),
          selectedItemColor: const Color(0xFF00E676),
          unselectedItemColor: Colors.white54,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map),
              label: 'Ranger Map',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.center_focus_strong_outlined),
              activeIcon: Icon(Icons.center_focus_strong),
              label: 'Scanner',
            ),
            BottomNavigationBarItem(
              icon: ValueListenableBuilder<int>(
                valueListenable: widget.syncService.pendingCountNotifier,
                builder: (context, pending, child) {
                  return Badge(
                    isLabelVisible: pending > 0,
                    label: Text('$pending'),
                    backgroundColor: const Color(0xFFFF9100),
                    child: const Icon(Icons.inventory_2_outlined),
                  );
                },
              ),
              activeIcon: const Icon(Icons.inventory_2),
              label: 'Incidents',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.analytics_outlined),
              activeIcon: Icon(Icons.analytics),
              label: 'Analytics',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
