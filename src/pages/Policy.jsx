import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { useApi } from '../lib/api';
import { setPageMeta } from '../lib/pageMeta';
import { policyBySlug } from '../../shared/policies';

// The admin writes plain text: a blank line starts a new paragraph, and a line starting with "## " is a heading.
function blocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .flatMap((b, i) => {
      const [first, ...rest] = b.split('\n');
      const heading = first.startsWith('## ') ? first.slice(3).trim() : null;
      const body = (heading ? rest.join('\n') : b).trim();
      return [
        heading ? (
          <h2 key={i + 'h'} className="hh" style={{ marginTop: '12px' }}>
            {heading}
          </h2>
        ) : null,
        body ? (
          <p key={i + 'p'} style={{ whiteSpace: 'pre-line', fontSize: '16px', lineHeight: '26px' }}>
            {body}
          </p>
        ) : null,
      ];
    });
}

export default function Policy() {
  const { slug } = useParams();
  const known = policyBySlug(slug);
  const page = useApi(known ? '/policies/' + slug : null);
  const title = page.data?.title || known?.title || 'Không tìm thấy trang';
  useEffect(() => {
    setPageMeta(title);
  }, [title]);

  return (
    <div className="cat">
      <SiteHeader active="none" />
      <main className="wrap" style={{ paddingBlock: '48px 96px' }}>
        <article style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span className="lbl">Chính sách</span>
          <h1 className="hlg">{title}</h1>
          {page.data ? (
            blocks(page.data.body)
          ) : !known || page.error ? (
            <p className="bsm mut" role="alert">
              Trang này chưa có nội dung. <Link to="/" className="deep">Về trang chủ</Link>
            </p>
          ) : (
            <p className="bsm mut" role="status">
              Đang tải...
            </p>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
