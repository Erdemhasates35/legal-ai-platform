# Legal AI Platform – Türk Hukuku + AİHM (ECHR)

**Sıfır-Hallüsinasyon Hukuki Yapay Zeka Platformu**  
Zero-Hallucination Legal AI Platform specialized for Turkish Law & European Court of Human Rights

## Kısa Açıklama (Türkçe)

Bu platform, Türk mahkemeleri (Yargıtay, Danıştay, Anayasa Mahkemesi) ve Avrupa İnsan Hakları Mahkemesi (AİHM) içtihatlarını kullanarak hukuki iddiaları **üç katmanlı doğrulama** ile kontrol eder:

1. **Biçimsel Deontik Mantık Motoru** – Kanun maddelerini zorunluluk mantığına çevirir ve çelişki olup olmadığını matematiksel olarak kontrol eder.
2. **Atıf Graf Sinir Ağı (GNN)** – Mahkeme kararlarını birbirine bağlayan bir grafik oluşturur ve en önemli emsalleri sıralar.
3. **Kuantum-Esinli Tensor Arama (Q-NLP)** – Uzun belgelerdeki anlam bağlarını koruyarak arama yapar.

Her iddia mutlaka bir kaynak kimliği (source_id) ile desteklenmek zorundadır. Desteklenmeyen iddialar reddedilir.

## English Summary

Enterprise-grade LegalTech platform that eliminates LLM hallucinations through a triple-verification layer (Deontic Logic + Citation GNN + Q-NLP Tensor Retrieval). Supports both Turkish high-court precedents and ECHR judgments. Built with Next.js 14, TypeScript strict mode, Supabase (pgvector), and deployed on Vercel.

## Hızlı Başlangıç (Quick Start)

```bash
git clone https://github.com/Erdemhasates35/legal-ai-platform.git
cd legal-ai-platform
npm install
cp .env.example .env.local
# Supabase ve diğer anahtarları doldurun
npm run dev
```

## Canlı Bağlantılar (Live URLs)

- **GitHub Deposu:** https://github.com/Erdemhasates35/legal-ai-platform
- **Vercel Üretim:** Deploy sonrası otomatik güncellenir
- **Netlify Yedek:** İsteğe bağlı yedek dağıtım

## Teknoloji Yığını

| Katman              | Teknoloji                          |
|---------------------|------------------------------------|
| Frontend            | Next.js 14 (App Router) + React Server Components |
| Dil                 | TypeScript 5+ (strict: true)       |
| Stil                | TailwindCSS + Shadcn/UI            |
| Veritabanı          | Supabase (PostgreSQL + pgvector)   |
| Doğrulama           | Deontik Mantık + GNN + Multi-Agent |
| CI/CD               | GitHub Actions → Vercel            |

## Akademik Temeller

- Deontik mantık: von Wright formalizmi + SAT çözücüler
- Atıf grafı: PageRank + betweenness centrality (hukuki emsal sıralaması)
- Tensor retrieval: Uzun menzilli bağımlılıkları koruyan Q-NLP yaklaşımı

## Lisans

MIT – Akademik ve ticari kullanım serbesttir (atıf şartıyla).
