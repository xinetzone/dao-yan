import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function SEO({
  title,
  description,
  keywords,
  image = 'https://dao-yan.enter.pro/og-image.jpg',
  url,
  type = 'website'
}: SEOProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh-CN';
  
  const baseTitle = isZh ? '道衍 - 帛书老子智慧修行平台' : 'DaoYan - Boshu Laozi Wisdom Platform';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  
  const baseDescription = isZh
    ? '探索马王堆帛书版《道德经》的智慧，融合帛书原文、传世版对照、现代解读与 AI 智慧引导。'
    : 'Explore the wisdom of Mawangdui Boshu Daodejing with original text, received text comparison, modern interpretation and AI guidance.';
  
  const finalDescription = description || baseDescription;
  const finalUrl = url || 'https://dao-yan.enter.pro/';
  const lang = isZh ? 'zh-CN' : 'en-US';

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
