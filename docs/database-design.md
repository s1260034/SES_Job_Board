# SES案件管理システム データベース設計書

## 1. データベース概要

### 1.1 データベース管理システム
- **DBMS**: PostgreSQL 14+
- **文字エンコーディング**: UTF-8
- **タイムゾーン**: Asia/Tokyo
- **接続プール**: 最大100接続

### 1.2 命名規則
- **テーブル名**: 複数形、スネークケース（例: `cases`, `user_applications`）
- **カラム名**: スネークケース（例: `created_at`, `rate_min`）
- **インデックス名**: `idx_テーブル名_カラム名`
- **外部キー名**: `fk_テーブル名_参照テーブル名`

## 2. テーブル設計

### 2.1 ユーザーテーブル (users)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales', 'engineer')),
    department VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    skills TEXT[], -- PostgreSQL配列型
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
```

### 2.2 案件テーブル (cases)
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    overview TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    preferred_skills TEXT[],
    rate_min INTEGER DEFAULT 0,
    rate_max INTEGER DEFAULT 0,
    work_location VARCHAR(200),
    remote_frequency VARCHAR(100),
    development_environment TEXT[],
    period VARCHAR(100),
    settlement_conditions VARCHAR(200),
    payment_terms VARCHAR(200),
    recruitment_count INTEGER DEFAULT 1,
    contract_type VARCHAR(50) DEFAULT '準委任契約',
    business_flow VARCHAR(50),
    foreign_national_allowed BOOLEAN DEFAULT FALSE,
    interview_method VARCHAR(100),
    expected_start_date DATE,
    work_hours VARCHAR(50),
    notes TEXT,
    email_subject VARCHAR(500),
    received_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'recruiting' 
        CHECK (status IN ('recruiting', 'proposing', 'contracted', 'ended')),
    image_url VARCHAR(500),
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_company_name ON cases(company_name);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_expected_start_date ON cases(expected_start_date);
CREATE INDEX idx_cases_rate_range ON cases(rate_min, rate_max);
-- GINインデックス（配列検索用）
CREATE INDEX idx_cases_required_skills ON cases USING GIN(required_skills);
CREATE INDEX idx_cases_preferred_skills ON cases USING GIN(preferred_skills);
```

### 2.3 応募テーブル (applications)
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    resume_url VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'reviewing', 'interview_scheduled', 
        'interview_completed', 'accepted', 'rejected', 'withdrawn'
    )),
    notes TEXT, -- 営業側のメモ
    interview_date TIMESTAMPTZ,
    feedback TEXT, -- 面談フィードバック
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 複合ユニーク制約（同じユーザーが同じ案件に複数応募できない）
    UNIQUE(case_id, user_id)
);

-- インデックス
CREATE INDEX idx_applications_case_id ON applications(case_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
CREATE INDEX idx_applications_interview_date ON applications(interview_date);
```

### 2.4 参考資料テーブル (reference_materials)
```sql
CREATE TABLE reference_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('document', 'image', 'link', 'other')),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_reference_materials_case_id ON reference_materials(case_id);
CREATE INDEX idx_reference_materials_type ON reference_materials(type);
```

### 2.5 お気に入りテーブル (favorites)
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(user_id, case_id)
);

-- インデックス
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_case_id ON favorites(case_id);
```

### 2.6 閲覧履歴テーブル (view_history)
```sql
CREATE TABLE view_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_view_history_user_id ON view_history(user_id);
CREATE INDEX idx_view_history_case_id ON view_history(case_id);
CREATE INDEX idx_view_history_viewed_at ON view_history(viewed_at);

-- パーティション（月別）- 大量データ対応
-- CREATE TABLE view_history_y2024m01 PARTITION OF view_history
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 2.7 システムログテーブル (system_logs)
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50), -- 'case', 'user', 'application'
    target_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_details ON system_logs USING GIN(details);
```

## 3. ビュー設計

### 3.1 案件統計ビュー (case_statistics)
```sql
CREATE VIEW case_statistics AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    status,
    COUNT(*) as case_count,
    AVG((rate_min + rate_max) / 2) as avg_rate,
    COUNT(DISTINCT created_by) as sales_count
FROM cases 
GROUP BY DATE_TRUNC('month', created_at), status;
```

### 3.2 エンジニア参画状況ビュー (engineer_participation)
```sql
CREATE VIEW engineer_participation AS
SELECT 
    u.id,
    u.name,
    u.department,
    u.experience_years,
    u.skills,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM applications a 
            WHERE a.user_id = u.id AND a.status = 'accepted'
        ) THEN 'participating'
        ELSE 'waiting'
    END as participation_status,
    (
        SELECT COUNT(*) FROM applications a 
        WHERE a.user_id = u.id
    ) as total_applications,
    (
        SELECT MAX(a.applied_at) FROM applications a 
        WHERE a.user_id = u.id
    ) as last_application_date
FROM users u 
WHERE u.role = 'engineer' AND u.is_active = TRUE;
```

### 3.3 案件詳細ビュー (case_details)
```sql
CREATE VIEW case_details AS
SELECT 
    c.*,
    creator.name as created_by_name,
    assignee.name as assigned_to_name,
    (
        SELECT COUNT(*) FROM applications a 
        WHERE a.case_id = c.id
    ) as application_count,
    (
        SELECT COUNT(*) FROM applications a 
        WHERE a.case_id = c.id AND a.status = 'accepted'
    ) as accepted_count,
    (
        SELECT COUNT(*) FROM reference_materials rm 
        WHERE rm.case_id = c.id
    ) as material_count
FROM cases c
LEFT JOIN users creator ON c.created_by = creator.id
LEFT JOIN users assignee ON c.assigned_to = assignee.id;
```

## 4. 制約・トリガー設計

### 4.1 データ整合性制約
```sql
-- 単価の整合性チェック
ALTER TABLE cases ADD CONSTRAINT chk_rate_range 
CHECK (rate_min <= rate_max OR rate_min = 0 OR rate_max = 0);

-- 募集人数の妥当性チェック
ALTER TABLE cases ADD CONSTRAINT chk_recruitment_count 
CHECK (recruitment_count > 0 AND recruitment_count <= 100);

-- 経験年数の妥当性チェック
ALTER TABLE users ADD CONSTRAINT chk_experience_years 
CHECK (experience_years >= 0 AND experience_years <= 50);
```

### 4.2 更新日時自動更新トリガー
```sql
-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガー設定
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.3 監査ログトリガー
```sql
-- 監査ログ記録関数
CREATE OR REPLACE FUNCTION log_data_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO system_logs (action, target_type, target_id, details)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 重要テーブルに監査ログトリガー設定
CREATE TRIGGER audit_cases 
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();

CREATE TRIGGER audit_applications 
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION log_data_changes();
```

## 5. パフォーマンス最適化

### 5.1 インデックス戦略
- **主キー**: UUID使用（分散環境対応）
- **外部キー**: 全て自動インデックス
- **検索頻度の高いカラム**: 個別インデックス
- **配列カラム**: GINインデックス
- **複合検索**: 複合インデックス

### 5.2 パーティショニング
```sql
-- 閲覧履歴テーブルの月別パーティション例
CREATE TABLE view_history (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    case_id UUID NOT NULL,
    viewed_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (viewed_at);

-- 月別パーティション作成
CREATE TABLE view_history_y2024m01 PARTITION OF view_history
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 5.3 クエリ最適化
- **EXPLAIN ANALYZE**: 実行計画の定期確認
- **統計情報更新**: ANALYZE の定期実行
- **不要データ削除**: 古い履歴データのアーカイブ
- **接続プール**: pgBouncer等の利用

## 6. セキュリティ設計

### 6.1 Row Level Security (RLS)
```sql
-- RLS有効化
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- エンジニアは自分の応募のみ閲覧可能
CREATE POLICY engineer_applications ON applications
    FOR ALL TO authenticated
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'sales')
        )
    );

-- 案件は全員閲覧可能、編集は営業・管理者のみ
CREATE POLICY case_select ON cases FOR SELECT TO authenticated USING (true);
CREATE POLICY case_modify ON cases FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'sales')
        )
    );
```

### 6.2 データ暗号化
- **保存時暗号化**: PostgreSQL TDE
- **通信暗号化**: SSL/TLS必須
- **機密データ**: 個人情報の暗号化カラム
- **バックアップ**: 暗号化バックアップ

## 7. バックアップ・復旧設計

### 7.1 バックアップ戦略
```sql
-- 日次フルバックアップ
pg_dump -h localhost -U postgres -d ses_management > backup_$(date +%Y%m%d).sql

-- 継続的アーカイブログ
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
```

### 7.2 復旧手順
1. **Point-in-Time Recovery**: WALログを使用した特定時点復旧
2. **レプリケーション**: ホットスタンバイサーバーでの冗長化
3. **災害復旧**: 地理的に分散したバックアップ

## 8. 監視・メンテナンス

### 8.1 監視項目
- **接続数**: 最大接続数の監視
- **クエリ性能**: 長時間実行クエリの検出
- **ディスク使用量**: テーブル・インデックスサイズ
- **レプリケーション遅延**: スタンバイサーバーとの同期状況

### 8.2 定期メンテナンス
```sql
-- 統計情報更新（週次）
ANALYZE;

-- 不要データ削除（月次）
DELETE FROM view_history WHERE viewed_at < NOW() - INTERVAL '3 months';
DELETE FROM system_logs WHERE created_at < NOW() - INTERVAL '1 year';

-- インデックス再構築（必要に応じて）
REINDEX INDEX idx_cases_required_skills;
```