/// Represents a Registered Citizen or Forest Guardian Profile
/// Used to attribute wildlife saves, anti-poaching reports, and conservation reward payouts.
class UserProfile {
  final String name;
  final String phone;
  final DateTime createdAt;

  const UserProfile({
    required this.name,
    required this.phone,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'phone': phone,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserProfile.fromMap(Map<dynamic, dynamic> map) {
    return UserProfile(
      name: map['name']?.toString() ?? '',
      phone: map['phone']?.toString() ?? '',
      createdAt: DateTime.tryParse(map['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  UserProfile copyWith({
    String? name,
    String? phone,
    DateTime? createdAt,
  }) {
    return UserProfile(
      name: name ?? this.name,
      phone: phone ?? this.phone,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
