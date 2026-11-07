import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useShop } from '../lib/config';
import { formatPrice } from '../lib/chibi';
import { formatDate } from '../../shared/format';
import { TRACK_STEPS, trackStep } from '../../shared/orders';

// What the customer sees for each status: headline and tag colour.
const CUSTOMER_STATUS = {
  new: ['Shop đã nhận đơn', 'tag t-sand'],
  preparing: ['Đang chuẩn bị nguyên liệu', 'tag t-sand'],
  crafting: ['Đang làm đồ', 'tag t-butter'],
  finished: ['Đã hoàn thiện', 'tag t-lav'],
  awaiting: ['Chờ bạn duyệt ảnh', 'tag t-butter'],
  revision: ['Shop đang chỉnh sửa', 'tag t-butter'],
  approved: ['Chờ giao vận chuyển', 'tag t-ok'],
  shipped: ['Đã giao vận chuyển', 'tag t-ok'],
};

export default function Track() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const shop = useShop();
  const [state, setState] = useMergedState({
    q: params.get('ma') || '',
    orders: null,
    by: 'code',
    lookupPhone: '',
    sel: 0,
    editing: false,
    editText: '',
    // The half of the proof the lookup did not give: the phone after a code lookup, the code after a phone lookup.
    proof: '',
    busy: false,
    error: '',
  });

  const st = state;
  const search = async (q) => {
    setState({ busy: true, error: '', editing: false });
    try {
      const { orders, by } = await api('/orders/track?q=' + encodeURIComponent(q.trim()));
      setState({
        busy: false,
        orders,
        by,
        lookupPhone: by === 'phone' ? q.trim() : '',
        proof: by === 'code' ? user?.phone || '' : '',
        sel: 0,
        error: orders.length ? '' : 'Không tìm thấy đơn nào với thông tin này.',
      });
    } catch (err) {
      setState({ busy: false, orders: null, error: err.message });
    }
  };

  // Links from the account page and the order confirmation open straight on the order.
  useEffect(() => {
    if (params.get('ma')) search(params.get('ma'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // The account can finish loading after that search; its phone fills the proof field.
  useEffect(() => {
    if (user?.phone && st.by === 'code' && !st.proof) setState({ proof: user.phone });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const order = st.orders?.[st.sel];
  const setStatus = (status) =>
    setState({ orders: st.orders.map((o, i) => (i === st.sel ? { ...o, status } : o)), editing: false, busy: false });
  const act = async (path, body, status) => {
    const byPhone = st.by === 'phone';
    const code = byPhone ? st.proof.trim().toUpperCase() : order.code;
    const phone = byPhone ? st.lookupPhone : st.proof;
    if (!code) return setState({ error: 'Bạn nhập mã đơn (trong tin nhắn xác nhận hoặc Zalo của shop) nhé.' });
    setState({ busy: true, error: '' });
    try {
      await api('/orders/' + encodeURIComponent(code) + path, { method: 'POST', body: { ...body, phone } });
      setStatus(status);
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  };

  const status = order?.status;
  const cur = trackStep(status);
  const steps = TRACK_STEPS.map((label, i) => {
    const done = i < cur,
      now = i === cur;
    return {
      n: i + 1,
      label: i === 3 && status === 'revision' ? 'Chỉnh sửa theo yêu cầu' : label,
      done,
      notDone: !done,
      state: done ? 'Hoàn tất' : now ? 'Đang ở bước này' : 'Chưa tới',
      dot:
        'width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex:none;font:600 13px/20px "Be Vietnam Pro",sans-serif;' +
        (done
          ? 'background:#fd9999;color:#2a1f2d;border:1px solid #fd9999'
          : now
            ? 'background:#2a1f2d;color:#fdf9f3;border:1px solid #2a1f2d'
            : 'background:#ffffff;color:#6b5f66;border:1px solid #857a80'),
      line:
        i === TRACK_STEPS.length - 1
          ? 'display:none'
          : 'width:2px;flex:1;min-height:20px;background:' + (done ? '#fd9999' : '#ebe1d5'),
    };
  });
  const vals = {
    steps,
    statusText: (CUSTOMER_STATUS[status] || CUSTOMER_STATUS.new)[0],
    statusCls: (CUSTOMER_STATUS[status] || CUSTOMER_STATUS.new)[1],
    isPending: status === 'awaiting' && !st.editing,
    isEditing: status === 'awaiting' && st.editing,
    isApproved: status === 'approved',
    isSent: status === 'revision',
    approve: () => act('/approve', {}, 'approved'),
    proofLabel: st.by === 'phone' ? 'Mã đơn để xác nhận' : 'Số điện thoại đặt hàng',
    proofHint:
      st.by === 'phone'
        ? 'Mã đơn có trên màn hình đặt hàng thành công và trong tin nhắn shop gửi.'
        : 'Shop đối chiếu số này với đơn để chắc chắn đúng là bạn.',
    proof: st.proof,
    // A failed approve/revision leaves its message up; editing the proof or switching forms clears it.
    onProof: (e) => setState({ proof: e.target.value, error: '' }),
    codeText: order ? order.code || order.maskedCode : '',
    askEdit: () => setState({ editing: true, error: '' }),
    cancelEdit: () => setState({ editing: false, error: '' }),
    sendEdit: () => act('/revision', { body: st.editText }, 'revision'),
    editText: st.editText,
    onEdit: (e) => setState({ editText: e.target.value }),
    q: st.q,
    onQ: (e) => setState({ q: e.target.value }),
    submit: (e) => {
      e.preventDefault();
      if (!st.q.trim()) return;
      setParams(/^ch-/i.test(st.q.trim()) ? { ma: st.q.trim().toUpperCase() } : {}, { replace: true });
      search(st.q);
    },
    picks:
      st.orders && st.orders.length > 1
        ? st.orders.map((o, i) => ({
            label: o.code || o.maskedCode + ', ' + formatDate(o.createdAt),
            cls: i === st.sel ? 'chip on' : 'chip',
            on: i === st.sel,
            pick: () => setState({ sel: i, editing: false, error: '' }),
          }))
        : [],
  };

  return (
    <div className="cat">
      <SiteHeader active="track" />
      <main
        className="wrap"
        style={{ paddingBlock: '24px 96px', display: 'flex', flexDirection: 'column', gap: '32px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span className="lbl">Tra cứu đơn hàng</span>
          <h1 className="hd">Đơn của bạn đang ở đâu?</h1>
          <p className="sub" style={{ maxWidth: '620px' }}>
            Nhập số điện thoại hoặc mã đơn để xem tiến độ và duyệt ảnh sản phẩm trước khi giao.
          </p>
        </div>
        <form
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}
          onSubmit={vals.submit}
        >
          <div className="field" style={{ flex: '1 1 320px', maxWidth: '520px' }}>
            <label htmlFor="tq">Số điện thoại hoặc mã đơn</label>
            <input
              id="tq"
              className="input"
              value={vals.q}
              onChange={vals.onQ}
              placeholder="09xx xxx xxx hoặc CH-XXXXXX"
              required
            />
          </div>
          <button type="submit" className="btn btn-ink btn-lg" disabled={st.busy}>
            {st.busy && !order ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </form>
        {st.error ? (
          <p
            className="bsm"
            role="alert"
            style={{ background: 'var(--danger-wash)', color: 'var(--danger)', borderRadius: '12px', padding: '12px 16px', maxWidth: '640px' }}
          >
            {st.error}
          </p>
        ) : null}
        {vals.picks.length ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="group" aria-label="Chọn đơn">
            {vals.picks.map((p) => (
              <button key={p.label} type="button" className={p.cls} aria-pressed={p.on} onClick={p.pick}>
                {p.label}
              </button>
            ))}
          </div>
        ) : null}
        {order ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
            <section
              style={{
                flex: '999 1 540px',
                minWidth: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="cap">Mã đơn</span>
                    <span className="hlg">{vals.codeText}</span>
                  </div>
                  <span className={vals.statusCls}>{vals.statusText}</span>
                </div>
                <ol
                  style={{
                    margin: '0',
                    padding: '0',
                    listStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {vals.steps.map((s, index) => (
                    <li key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          alignSelf: 'stretch',
                        }}
                      >
                        <span style={css(s.dot)}>
                          {s.done ? (
                            <>
                              <Icon
                                name="check"
                                style={{ width: '16px', height: '16px', strokeWidth: '2.4' }}
                              />
                            </>
                          ) : null}
                          {s.notDone ? <>{s.n}</> : null}
                        </span>
                        <span style={css(s.line)} />
                      </div>
                      <div
                        style={{
                          paddingBottom: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          paddingTop: '6px',
                        }}
                      >
                        <span className="bsm" style={{ fontWeight: '600' }}>
                          {s.label}
                        </span>
                        <span className="cap">{s.state}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h2 className="hh">Ảnh sản phẩm hoàn thiện</h2>
                  <p className="bsm mut">Shop gửi ảnh thật để bạn xem trước khi giao cho đơn vị vận chuyển.</p>
                </div>
                {order.photos.length ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
                      gap: '12px',
                    }}
                  >
                    {order.photos.map((ph) => (
                      <a key={ph.id} href={ph.url} target="_blank" rel="noreferrer">
                        <img
                          src={ph.url}
                          alt={'Ảnh sản phẩm đơn ' + vals.codeText}
                          style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '16px', display: 'block' }}
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div
                    className="ph"
                    style={{ aspectRatio: '2 / 1', flexDirection: 'column', gap: '8px', textAlign: 'center', padding: '16px' }}
                  >
                    <Icon name="image" className="ic ic-24" />
                    <span className="bsm">Shop sẽ gửi ảnh ở đây khi sản phẩm hoàn thiện.</span>
                  </div>
                )}
                {status === 'awaiting' ? (
                  <div className="field" style={{ maxWidth: '360px' }}>
                    <label htmlFor="proof">{vals.proofLabel}</label>
                    <input
                      id="proof"
                      className="input"
                      value={vals.proof}
                      onChange={vals.onProof}
                      autoComplete={st.by === 'phone' ? 'off' : 'tel'}
                      placeholder={st.by === 'phone' ? 'CH-XXXXXX' : '09xx xxx xxx'}
                    />
                    <span className="cap">{vals.proofHint}</span>
                  </div>
                ) : null}
                {vals.isPending ? (
                  <>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ink btn-lg" onClick={vals.approve} disabled={st.busy}>
                        <Icon name="check" />
                        Xác nhận, shop giao hàng
                      </button>
                      <button type="button" className="btn btn-line btn-lg" onClick={vals.askEdit}>
                        Yêu cầu chỉnh sửa
                      </button>
                    </div>
                    <p className="cap">Chỉ khi bạn xác nhận, shop mới giao cho đơn vị vận chuyển.</p>
                  </>
                ) : null}
                {vals.isEditing ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div className="field">
                        <label htmlFor="edit">Bạn muốn shop chỉnh gì?</label>
                        <textarea
                          id="edit"
                          className="input"
                          rows="3"
                          placeholder="Ví dụ: đổi màu hoa, chỉnh lại kiểu tóc nhân vật 2"
                          value={vals.editText}
                          onChange={vals.onEdit}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-ink"
                          onClick={vals.sendEdit}
                          disabled={st.busy || !st.editText.trim()}
                        >
                          Gửi yêu cầu cho shop
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={vals.cancelEdit}>
                          Quay lại
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
                {vals.isApproved ? (
                  <>
                    <div
                      role="status"
                      style={{
                        background: '#d3efe9',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        color: '#2a1f2d',
                      }}
                    >
                      <Icon name="check" style={{ color: '#256b4c' }} />
                      <div>
                        <div className="bsm" style={{ fontWeight: '600', color: '#256b4c' }}>
                          Đã xác nhận ảnh
                        </div>
                        <div className="bsm">
                          Cảm ơn bạn. Shop sẽ giao cho đơn vị vận chuyển và cập nhật tại đây.
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {vals.isSent ? (
                  <>
                    <div
                      role="status"
                      style={{
                        background: '#fbeab4',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        color: '#2a1f2d',
                      }}
                    >
                      <Icon name="message" />
                      <div>
                        <div className="bsm" style={{ fontWeight: '600' }}>
                          Đã gửi yêu cầu chỉnh sửa
                        </div>
                        <div className="bsm">Shop sẽ chỉnh theo ý bạn và gửi lại ảnh mới để duyệt.</div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </section>
            <aside
              style={{
                flex: '1 1 320px',
                maxWidth: '420px',
                minWidth: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 className="hh">Chi tiết đơn</h2>
                {order.items.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '12px',
                        background: '#fddede',
                        overflow: 'hidden',
                        position: 'relative',
                        flex: 'none',
                      }}
                    >
                      {it.design?.a ? (
                        <div style={{ position: 'absolute', width: '80px', left: '-4px', top: '-2px' }}>
                          <Chibi {...it.design.a} />
                        </div>
                      ) : null}
                    </div>
                    <div style={{ flex: '1', minWidth: '0' }}>
                      <div className="bsm" style={{ fontWeight: '600' }}>
                        {it.qty} x {it.title}
                      </div>
                      <div className="cap">{[it.sub, it.variant].filter(Boolean).join(', ')}</div>
                    </div>
                  </div>
                ))}
                <hr className="hr" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="cap">Ngày đặt</span>
                  <span className="bsm" style={{ fontWeight: '500' }}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="flabel">Tổng tạm tính</span>
                  <span className="hh">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div
                style={{
                  background: '#fddede',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <span className="hh">Cần trao đổi thêm?</span>
                <span className="bsm">
                  {shop.zaloUrl || shop.messengerUrl || shop.phone
                    ? 'Chat với shop để chỉnh sửa hoặc hỏi thêm về đơn.'
                    : 'Shop sẽ liên hệ bạn qua số điện thoại đã đặt hàng.'}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {shop.zaloUrl ? (
                    <a href={shop.zaloUrl} target="_blank" rel="noreferrer" className="btn btn-ink">
                      Chat Zalo
                    </a>
                  ) : null}
                  {shop.messengerUrl ? (
                    <a href={shop.messengerUrl} target="_blank" rel="noreferrer" className="btn btn-line">
                      Messenger
                    </a>
                  ) : null}
                  {shop.phone ? (
                    <a href={'tel:' + shop.phone} className="btn btn-line">
                      Gọi {shop.phone}
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
