# Legal AI Platform – Türk Hukuku + AİHM (ECHR)

**Kaynak-doğrulamalı LegalTech platformu**  
Turkish Law + European Court of Human Rights research and verification workspace.

## Platform ilkesi

Platformun doğrulama çekirdeği **fail-closed source provenance** yaklaşımı kullanır. Bir hukuki iddia doğrulanmış sonuç olarak işaretlenmeden önce:

1. İddia metni boş olmamalıdır.
2. En az bir `source_id` bulunmalıdır.
3. Her `source_id` kayıtlı olmalıdır.
4. Her kaynak aktif olmalıdır.
5. Kaynağın deontik formal ifadesi geçerli olmalıdır.
6. Sonuç, doğrulanmış kaynak kümesini korumalıdır.

Bu nedenle kaynaklandırılmamış veya doğrulanamayan bir iddia doğrulanmış hukuki sonuç olarak sunulmaz.

## Mevcut modüller

- Google OAuth + Supabase SSR oturumu.
- Admin onayı ve ilk yönetici bootstrap akışı.
- Free ve Pro++ (`private`) yetkilendirme katmanları.
- Özel Supabase Storage alanında kullanıcıya bağlı PDF/DOC/DOCX/UDF yükleme.
- Yetkili, kısa ömürlü imzalı dosya erişimi.
- Deterministik deontik doğrulama.
- Kaynak kimliği zorunluluğu ve yapılandırılmış ret nedenleri.
- Pro++ citation graph sıralaması.
- Pro++ source-gated consortium ve analiz endpoint'i.
- GitHub Actions kalite kapısı: lint, typecheck, doğrulama testleri ve build.
- Pro-Plasma koyu kurumsal arayüz.

## Önemli sınır

“Zero hallucination” burada mutlak bir matematiksel/evrensel garanti olarak kullanılmaz. Teknik olarak garanti edilen özellik, **doğrulanmamış çıktının doğrulanmış hukuki sonuç olarak kabul edilmemesidir**. Hukuki yorumun nihai değerlendirmesi profesyonel kullanıcıya aittir.

## Hızlı başlangıç

```bash
git clone https://github.com/Erdemhasates35/legal-ai-platform.git
cd legal-ai-platform
npm install
cp .env.example .env.local
npm run dev
```

Gerekli ortam değişkenleri:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_BOOTSTRAP_EMAIL
```

## Supabase

- Mevcut temel şema: `supabase/schema.sql`
- Güvenlik migration'ı: `supabase/migrations/20260916_security_hardening.sql`
- Google OAuth Supabase Auth üzerinden yapılandırılır.
- `legal-files` bucket'ı private olmalıdır.

## Test ve kalite

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Canlı bağlantılar

- GitHub: https://github.com/Erdemhasates35/legal-ai-platform
- Vercel proje alanı: https://vercel.com/erdemhasates-quantum-nexus/legal-ai-platform
- Vercel production domain: https://legal-ai-platform-erdemhasates-quantum-nexus.vercel.app

## Hukuki kaynaklar

UYAP'ın resmi sistemi ve UDF/karar hizmetleri Adalet Bakanlığı UYAP altyapısı üzerinden sağlanır. Platform, kullanıcı tarafından yüklenen belgeleri ve uygulamaya kaydedilmiş kaynak kayıtlarını provenance zincirinde tutar; resmi UYAP hesabı yerine geçmez.

## Lisans

MIT – Akademik ve ticari kullanım serbesttir (atıf şartıyla).
