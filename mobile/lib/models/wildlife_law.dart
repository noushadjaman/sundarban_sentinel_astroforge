class WildlifeLaw {
  final String label;
  final String bengaliName;
  final String scientificName;
  final String category;
  final String legalStatus;
  final String actName;
  final String section;
  final String punishment;
  final String actionInstruction;

  const WildlifeLaw({
    required this.label,
    required this.bengaliName,
    required this.scientificName,
    required this.category,
    required this.legalStatus,
    required this.actName,
    required this.section,
    required this.punishment,
    required this.actionInstruction,
  });

  factory WildlifeLaw.fromJson(Map<String, dynamic> json) {
    return WildlifeLaw(
      label: (json['label'] as String?)?.trim() ?? '',
      bengaliName: (json['bengali_name'] ?? json['bengaliName'] ?? '') as String,
      scientificName: (json['scientific_name'] ?? json['scientificName'] ?? '') as String,
      category: (json['category'] as String?) ?? '',
      legalStatus: (json['legal_status'] ?? json['legalStatus'] ?? '') as String,
      actName: (json['act_name'] ?? json['actName'] ?? '') as String,
      section: (json['section'] as String?) ?? '',
      punishment: (json['punishment'] as String?) ?? '',
      actionInstruction: (json['action_instruction'] ?? json['actionInstruction'] ?? '') as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'bengali_name': bengaliName,
      'scientific_name': scientificName,
      'category': category,
      'legal_status': legalStatus,
      'act_name': actName,
      'section': section,
      'punishment': punishment,
      'action_instruction': actionInstruction,
    };
  }

  // --- Decoupled Legal Lookup Pipeline Accessors ---

  /// Common/Bengali Name
  String get commonName => bengaliName.isNotEmpty ? bengaliName : label;

  /// Statutory Act Name
  String get act => actName;

  /// Statutory Penalty / Punishment summary
  String get penaltySummary => punishment;

  /// Bail status: false if non-bailable under statutory schedule, true otherwise
  bool get isBailable {
    final lower = punishment.toLowerCase();
    if (lower.contains('জামিন-অযোগ্য') || lower.contains('non-bailable')) {
      return false;
    }
    if (legalStatus.toUpperCase().contains('STRICTLY_PROHIBITED') ||
        legalStatus.toUpperCase().contains('CRITICALLY')) {
      return false;
    }
    return true;
  }

  /// Formatted bailable status badge text
  String get bailableStatus =>
      isBailable ? 'Bailable (জামিনযোগ্য)' : 'Non-Bailable (জামিন-অযোগ্য)';

  /// Schedule Tier classification
  String get scheduleTier {
    if (section.contains('তফসিল-১') ||
        section.contains('Schedule-1') ||
        section.contains('Schedule-I')) {
      return 'Schedule-I (তফসিল-১)';
    } else if (section.contains('তফসিল-২') ||
        section.contains('Schedule-2') ||
        section.contains('Schedule-II')) {
      return 'Schedule-II (তফসিল-২)';
    } else if (category == 'illegal_gear' ||
        actName.contains('মৎস্য') ||
        label.contains('jal')) {
      return 'Special Fisheries Act (মৎস্য সংরক্ষণ আইন ১৯৫০)';
    } else if (actName.contains('বন আইন')) {
      return 'Forest Act 1927 (সংরক্ষিত বন বিধিমালা)';
    }
    return 'Protected Tier (সংরক্ষিত)';
  }

  bool get isStrictlyProhibited =>
      legalStatus.toUpperCase().contains('STRICTLY_PROHIBITED') ||
      legalStatus.toUpperCase().contains('CRITICALLY');

  bool get isBannedGearOrPractice =>
      legalStatus.toUpperCase().contains('BANNED') ||
      category.toUpperCase().contains('ILLEGAL') ||
      category == 'illegal_gear';

  @override
  String toString() =>
      'WildlifeLaw(label: $label, common: $commonName, act: $act, section: $section, bailable: $bailableStatus)';
}
