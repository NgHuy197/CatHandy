import Chibi from './Chibi';
import css from '../lib/css';

export default function MiniChibi(props) {
  const c = props.cfg || {};
  const head = (props.crop || 'head') === 'head';
  const vals = {
    c: c,
    inner: head
      ? 'position:absolute;width:112px;left:-20px;top:-14px'
      : 'position:absolute;width:58px;left:7px;top:2px',
  };

  return (
    <div
      style={{
        width: '72px',
        height: '72px',
        borderRadius: '12px',
        background: '#f6efe6',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={css(vals.inner)}>
        <Chibi {...vals.c} />
      </div>
    </div>
  );
}
