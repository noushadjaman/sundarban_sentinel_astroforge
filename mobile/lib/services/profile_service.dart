import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/user_profile.dart';
import '../models/incident_report.dart';

/// Centralized Profile and Conservation Reward Management Service
class ProfileService {
  static const String boxName = 'profile_vault';
  static const String profileKey = 'current_user_profile';

  static final ProfileService _instance = ProfileService._internal();
  factory ProfileService() => _instance;
  ProfileService._internal();

  Box? _box;
  final ValueNotifier<UserProfile?> profileNotifier = ValueNotifier<UserProfile?>(null);

  bool get isProfileComplete {
    final p = profileNotifier.value;
    return p != null && p.name.trim().isNotEmpty && p.phone.trim().isNotEmpty;
  }

  UserProfile? get currentProfile => profileNotifier.value;

  Future<void> initialize() async {
    _box = await Hive.openBox(boxName);
    final data = _box?.get(profileKey);
    if (data is Map) {
      profileNotifier.value = UserProfile.fromMap(data);
    }
  }

  /// Saves or updates the user profile
  Future<UserProfile> saveProfile({
    required String name,
    required String phone,
  }) async {
    final box = _box ?? await Hive.openBox(boxName);
    final profile = UserProfile(
      name: name.trim(),
      phone: phone.trim(),
      createdAt: profileNotifier.value?.createdAt ?? DateTime.now(),
    );

    await box.put(profileKey, profile.toMap());
    profileNotifier.value = profile;
    return profile;
  }

  /// Clears the stored profile
  Future<void> clearProfile() async {
    final box = _box ?? await Hive.openBox(boxName);
    await box.delete(profileKey);
    profileNotifier.value = null;
  }

  /// Calculates the conservation reward amount in Bangladeshi Taka (BDT)
  /// awarded when a user helps save a species or report illegal poaching gear.
  int calculateRewardBdt(String label) {
    final lower = label.toLowerCase();
    if (lower.contains('tiger')) {
      return 500; // 500 BDT for Royal Bengal Tiger protection
    } else if (lower.contains('dolphin')) {
      return 400; // 400 BDT for Ganges / Irrawaddy Dolphin protection
    } else if (lower.contains('jal') || lower.contains('net')) {
      return 350; // 350 BDT for seizing illegal fishing nets
    } else if (lower.contains('deer')) {
      return 300; // 300 BDT for Chital / Barking deer protection
    } else if (lower.contains('adjutant') || lower.contains('bird') || lower.contains('eagle')) {
      return 250; // 250 BDT for endangered bird habitat reporting
    }
    return 200; // Base bounty for wildlife reporting
  }

  String getRewardTitle(String label) {
    final lower = label.toLowerCase();
    if (lower.contains('tiger')) {
      return 'Royal Bengal Tiger Savior Bounty';
    } else if (lower.contains('dolphin')) {
      return 'River Dolphin Rescue Reward';
    } else if (lower.contains('jal') || lower.contains('net')) {
      return 'Illegal Net Seizure Bounty';
    } else if (lower.contains('deer')) {
      return 'Spotted Deer Protection Bounty';
    } else if (lower.contains('adjutant') || lower.contains('bird')) {
      return 'Avian Wildlife Savior Incentive';
    }
    return 'Sundarban Eco-Guardian Reward';
  }

  String getRewardBengaliTitle(String label) {
    final lower = label.toLowerCase();
    if (lower.contains('tiger')) {
      return 'রয়েল বেঙ্গল বাঘ সংরক্ষণ পুরস্কার';
    } else if (lower.contains('dolphin')) {
      return 'গাঙ্গেয় ডলফিন রক্ষা ইনসেন্টিভ';
    } else if (lower.contains('jal') || lower.contains('net')) {
      return 'নিষিদ্ধ কারেন্ট জাল আটক পুরস্কার';
    } else if (lower.contains('deer')) {
      return 'চিত্রা হরিণ সুরক্ষা অনুদান';
    } else if (lower.contains('adjutant') || lower.contains('bird')) {
      return 'বিপন্ন পাখি ও জলভূমি রক্ষা পুরস্কার';
    }
    return 'সুন্দরবন সেন্টিনেল বন্যপ্রাণী বন্ধু পুরস্কার';
  }

  /// Computes total earned rewards from user's submitted reports
  int computeTotalEarnedRewards(List<IncidentReport> reports) {
    int total = 0;
    for (final r in reports) {
      final bounty = r.rewardAmountBdt > 0 ? r.rewardAmountBdt : calculateRewardBdt(r.label);
      total += bounty;
    }
    return total;
  }
}
