import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:sundarban_sentinel/models/wildlife_law.dart';
import 'package:sundarban_sentinel/services/legal_registry_service.dart';

void main() {
  const expectedLabels = [
    'bengal_tiger',
    'chital_deer',
    'barking_deer',
    'wild_boar',
    'fishing_cat',
    'leopard_cat',
    'smooth_coated_otter',
    'rhesus_macaque',
    'pangolin',
    'ganges_dolphin',
    'irrawaddy_dolphin',
    'finless_porpoise',
    'saltwater_crocodile',
    'king_cobra',
    'rock_python',
    'monitor_lizard',
    'olive_ridley_turtle',
    'batagur_baska',
    'horseshoe_crab',
    'white_bellied_sea_eagle',
    'masked_finfoot',
    'lesser_adjutant',
    'mangrove_pitta',
    'current_jal',
    'behundi_jal',
    'poison_fishing',
    'jatka_hilsa',
    'mother_hilsa',
    'sundari_wood',
    'golpata_illegal',
    'mud_crab_undersized',
  ];

  group('Bangladesh Wildlife Laws JSON Asset File Verification', () {
    test('JSON file exists and parses with all 31 entries', () {
      final file = File('assets/data/bangladesh_wildlife_laws.json');
      expect(file.existsSync(), isTrue);

      final content = file.readAsStringSync();
      final Map<String, dynamic> jsonMap = jsonDecode(content);

      expect(jsonMap.length, greaterThanOrEqualTo(30));

      for (final label in expectedLabels) {
        expect(jsonMap.containsKey(label), isTrue,
            reason: 'Missing key: $label in JSON asset');
        final item = jsonMap[label] as Map<String, dynamic>;
        expect(item['label'], equals(label));
        expect(item['bengali_name'], isNotEmpty);
        expect(item['scientific_name'], isNotEmpty);
        expect(item['category'], isNotEmpty);
        expect(item['legal_status'], isNotEmpty);
        expect(item['act_name'], isNotEmpty);
        expect(item['section'], isNotEmpty);
        expect(item['punishment'], isNotEmpty);
        expect(item['action_instruction'], isNotEmpty);
      }
    });
  });

  group('WildlifeLaw Model Field & Serialization Integrity', () {
    test('Ensures all 9 required fields are present and accessible', () {
      const law = WildlifeLaw(
        label: 'bengal_tiger',
        bengaliName: 'রয়েল বেঙ্গল টাইগার',
        scientificName: 'Panthera tigris',
        category: 'mammal',
        legalStatus: 'STRICTLY_PROHIBITED',
        actName: 'বন্যপ্রাণী (সংরক্ষণ ও নিরাপত্তা) আইন, ২০১২',
        section: 'ধারা ৩৬ (তফসিল-১)',
        punishment: '২ থেকে ৭ বছর কারাদণ্ড এবং ১ লাখ থেকে ১০ লাখ টাকা জরিমানা। জামিন-অযোগ্য অপরাধ। পুনরাবৃত্তিতে সর্বোচ্চ ১২ বছর কারাদণ্ড।',
        actionInstruction: 'শিকার, হত্যা, চামড়া বা দেহাংশ রাখা সম্পূর্ণ নিষিদ্ধ। অবিলম্বে জরুরি রেঞ্জার অ্যালার্ট দিন।',
      );

      expect(law.label, 'bengal_tiger');
      expect(law.bengaliName, 'রয়েল বেঙ্গল টাইগার');
      expect(law.scientificName, 'Panthera tigris');
      expect(law.category, 'mammal');
      expect(law.legalStatus, 'STRICTLY_PROHIBITED');
      expect(law.actName, 'বন্যপ্রাণী (সংরক্ষণ ও নিরাপত্তা) আইন, ২০১২');
      expect(law.section, 'ধারা ৩৬ (তফসিল-১)');
      expect(law.punishment, contains('২ থেকে ৭ বছর'));
      expect(law.actionInstruction, contains('রেঞ্জার অ্যালার্ট'));
      expect(law.isStrictlyProhibited, isTrue);

      final json = law.toJson();
      expect(json['label'], 'bengal_tiger');
      expect(json['bengali_name'], 'রয়েল বেঙ্গল টাইগার');
      expect(json['scientific_name'], 'Panthera tigris');
      expect(json['category'], 'mammal');
      expect(json['legal_status'], 'STRICTLY_PROHIBITED');
      expect(json['act_name'], 'বন্যপ্রাণী (সংরক্ষণ ও নিরাপত্তা) আইন, ২০১২');
      expect(json['section'], 'ধারা ৩৬ (তফসিল-১)');
      expect(json['punishment'], contains('২ থেকে ৭ বছর'));
      expect(json['action_instruction'], contains('রেঞ্জার অ্যালার্ট'));
    });
  });

  group('LegalRegistryService Case-Insensitive Lookup Verification', () {
    test('Verifies that LegalRegistryService.lookup handles all 30+ labels', () {
      for (final label in expectedLabels) {
        // Standard lowercase
        final resultLower = LegalRegistryService.lookup(label);
        expect(resultLower, isNotNull, reason: 'Failed lookup for $label');
        expect(resultLower!.label, equals(label));
        expect(resultLower.bengaliName, isNotEmpty);
        expect(resultLower.scientificName, isNotEmpty);
        expect(resultLower.category, isNotEmpty);
        expect(resultLower.legalStatus, isNotEmpty);
        expect(resultLower.actName, isNotEmpty);
        expect(resultLower.section, isNotEmpty);
        expect(resultLower.punishment, isNotEmpty);
        expect(resultLower.actionInstruction, isNotEmpty);

        // Case-insensitive: UPPERCASE
        final resultUpper = LegalRegistryService.lookup(label.toUpperCase());
        expect(resultUpper, isNotNull,
            reason: 'Failed uppercase lookup for ${label.toUpperCase()}');
        expect(resultUpper!.label, equals(label));

        // Mixed Case with spaces instead of underscores (e.g. "Bengal Tiger")
        final spacedName = label.replaceAll('_', ' ');
        final resultSpaced = LegalRegistryService.lookup(spacedName);
        expect(resultSpaced, isNotNull,
            reason: 'Failed spaced lookup for $spacedName');
        expect(resultSpaced!.label, equals(label));

        // Hyphenated (e.g. "bengal-tiger")
        final hyphenated = label.replaceAll('_', '-');
        final resultHyphen = LegalRegistryService.lookup(hyphenated);
        expect(resultHyphen, isNotNull,
            reason: 'Failed hyphenated lookup for $hyphenated');
        expect(resultHyphen!.label, equals(label));
      }
    });

    test('Case-insensitivity specific examples', () {
      expect(LegalRegistryService.lookup('BENGAL_TIGER')?.bengaliName, 'রয়েল বেঙ্গল টাইগার');
      expect(LegalRegistryService.lookup('Chital Deer')?.scientificName, 'Axis axis');
      expect(LegalRegistryService.lookup('current_jal')?.legalStatus, 'BANNED_GEAR');
      expect(LegalRegistryService.lookup('POISON FISHING')?.category, 'illegal_practice');
      expect(LegalRegistryService.lookup('sundari wood')?.label, 'sundari_wood');
    });

    test('Returns null for unknown query', () {
      expect(LegalRegistryService.lookup('unknown_alien_species_xyz'), isNull);
      expect(LegalRegistryService.lookup(null), isNull);
      expect(LegalRegistryService.lookup(''), isNull);
    });
  });
}
