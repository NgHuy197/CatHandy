import { Link } from 'react-router-dom';
import { useFilledPolicies } from '../lib/config';

// Says what the form's personal data is used for before it is sent, linking the privacy policy once the shop has written it.
export default function PrivacyNote({ children }) {
  const privacy = useFilledPolicies().find((p) => p.key === 'privacy');
  return (
    <p className="cap mut">
      {children}{' '}
      {privacy ? (
        <>
          Xem thêm ở{' '}
          <Link to={'/chinh-sach/' + privacy.slug} className="deep" style={{ textDecoration: 'underline' }}>
            {privacy.title.toLowerCase()}
          </Link>
          .
        </>
      ) : null}
    </p>
  );
}
