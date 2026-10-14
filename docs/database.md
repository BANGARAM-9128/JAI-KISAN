# Jai Kisan — Database Schema

## Entity Relationship Overview

```
Users ──────── FarmerProfiles ──────── CropRecords
  │                 │                       │
  │                 │                       │
  ├── Notifications │                  Advisories ── Feedback
  │                 │                       │
  ├── AuditLogs     └── WeatherCache        │
  │                                    AdvisoryRules
  └── (role-based)
       ├── farmer
       ├── expert
       └── admin

KnowledgeDocuments (standalone, referenced by advisories)
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID/INTEGER PK | Auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | DEFAULT 'farmer' (farmer/expert/admin) |
| language_pref | VARCHAR(5) | DEFAULT 'te' |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW |
| updated_at | TIMESTAMP | DEFAULT NOW, ON UPDATE |

### farmer_profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | Auto |
| user_id | INTEGER FK → users.id | UNIQUE, NOT NULL |
| display_name | VARCHAR(100) | NOT NULL |
| village | VARCHAR(100) | |
| district | VARCHAR(100) | NOT NULL |
| state | VARCHAR(100) | DEFAULT 'Andhra Pradesh' |
| latitude | FLOAT | |
| longitude | FLOAT | |
| irrigation_type | VARCHAR(50) | (rainfed/canal/borewell/drip/sprinkler) |
| soil_type | VARCHAR(50) | |
| farm_size_acres | FLOAT | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### crop_records
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| farmer_profile_id | INTEGER FK → farmer_profiles.id | NOT NULL |
| crop_name | VARCHAR(100) | NOT NULL |
| variety | VARCHAR(100) | |
| sowing_date | DATE | |
| growth_stage | VARCHAR(50) | |
| field_area_acres | FLOAT | |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### weather_cache
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| latitude | FLOAT | NOT NULL |
| longitude | FLOAT | NOT NULL |
| forecast_json | TEXT/JSON | NOT NULL |
| provider | VARCHAR(50) | NOT NULL |
| retrieved_at | TIMESTAMP | NOT NULL |
| valid_until | TIMESTAMP | NOT NULL |

**Index**: (latitude, longitude, retrieved_at)

### advisories
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| farmer_profile_id | INTEGER FK | NOT NULL |
| crop_record_id | INTEGER FK | |
| rule_id | VARCHAR(50) | |
| title | VARCHAR(255) | NOT NULL |
| title_te | VARCHAR(255) | |
| recommendation | TEXT | NOT NULL |
| recommendation_te | TEXT | |
| severity | VARCHAR(20) | (info/low/medium/high/critical) |
| weather_summary | TEXT | |
| source_reference | TEXT | |
| confidence | VARCHAR(20) | (high/medium/low/uncertain) |
| alternative_action | TEXT | |
| created_at | TIMESTAMP | |
| expires_at | TIMESTAMP | |
| is_active | BOOLEAN | DEFAULT TRUE |

### advisory_rules
| Column | Type | Constraints |
|--------|------|-------------|
| id | VARCHAR(50) PK | e.g., "heavy_rain_rice" |
| crop_name | VARCHAR(100) | |
| condition_type | VARCHAR(50) | (rainfall/temperature/wind/humidity/disease_risk) |
| description | TEXT | |
| description_te | TEXT | |
| thresholds_json | TEXT/JSON | |
| time_window_hours | INTEGER | |
| severity | VARCHAR(20) | |
| source_reference | TEXT | |
| source_org | VARCHAR(100) | |
| last_reviewed | DATE | |
| is_active | BOOLEAN | DEFAULT TRUE |

### notifications
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| title_te | VARCHAR(255) | |
| message | TEXT | NOT NULL |
| message_te | TEXT | |
| notification_type | VARCHAR(50) | (weather_alert/advisory/reminder/system) |
| severity | VARCHAR(20) | |
| is_read | BOOLEAN | DEFAULT FALSE |
| source | VARCHAR(100) | |
| related_advisory_id | INTEGER FK | |
| created_at | TIMESTAMP | |
| expires_at | TIMESTAMP | |

### feedback
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| user_id | INTEGER FK | NOT NULL |
| advisory_id | INTEGER FK | NOT NULL |
| was_understandable | BOOLEAN | |
| was_relevant | BOOLEAN | |
| was_followed | BOOLEAN | |
| was_useful | BOOLEAN | |
| weather_accuracy_note | TEXT | |
| additional_comment | TEXT | |
| created_at | TIMESTAMP | |

### knowledge_documents
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| title | VARCHAR(255) | NOT NULL |
| source_org | VARCHAR(100) | NOT NULL |
| source_url | VARCHAR(500) | |
| content | TEXT | NOT NULL |
| document_type | VARCHAR(50) | (advisory/research/guideline/alert) |
| crop_tags | VARCHAR(500) | Comma-separated |
| region_tags | VARCHAR(500) | |
| language | VARCHAR(5) | DEFAULT 'en' |
| publication_date | DATE | |
| review_date | DATE | |
| is_verified | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | |

### audit_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(50) | |
| entity_id | VARCHAR(50) | |
| details | TEXT | |
| ip_address | VARCHAR(45) | |
| created_at | TIMESTAMP | DEFAULT NOW |

## Key Relationships
- User 1:1 FarmerProfile
- FarmerProfile 1:N CropRecords
- FarmerProfile 1:N Advisories
- CropRecord 1:N Advisories
- User 1:N Notifications
- Advisory 1:N Feedback
- User 1:N Feedback
- User 1:N AuditLogs

## Indexes
- `users.email` — UNIQUE
- `farmer_profiles.user_id` — UNIQUE
- `crop_records.farmer_profile_id` — INDEX
- `weather_cache.(latitude, longitude, retrieved_at)` — COMPOSITE INDEX
- `advisories.farmer_profile_id` — INDEX
- `advisories.created_at` — INDEX
- `notifications.(user_id, is_read)` — COMPOSITE INDEX
- `feedback.advisory_id` — INDEX
- `audit_logs.created_at` — INDEX
