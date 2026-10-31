import SiteHeader from '../components/SiteHeader';
import Chibi from '../components/Chibi';
import SiteFooter from '../components/SiteFooter';
import Icon from '../components/Icon';
import useMergedState from '../lib/useMergedState';
import css from '../lib/css';

export default function Track() {
  const [state, setState] = useMergedState({ mode: 'pending', editText: '' });

  const st = state;
  const mode = st.mode;
  const cur = mode === 'approved' ? 4 : 3;
  const LABELS = [
    'Đang chuẩn bị nguyên liệu',
    'Đang làm đồ',
    'Đã hoàn thiện, gửi ảnh duyệt',
    mode === 'sent' ? 'Chỉnh sửa theo yêu cầu' : 'Chờ bạn duyệt ảnh',
    'Đã giao bên vận chuyển',
  ];
  const steps = LABELS.map((label, i) => {
    const done = i < cur,
      now = i === cur;
    return {
      n: i + 1,
      label,
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
        i === LABELS.length - 1
          ? 'display:none'
          : 'width:2px;flex:1;min-height:20px;background:' + (done ? '#fd9999' : '#ebe1d5'),
    };
  });
  const vals = {
    steps,
    statusText:
      mode === 'approved'
        ? 'Chờ giao vận chuyển'
        : mode === 'sent'
          ? 'Shop đang chỉnh sửa'
          : 'Chờ bạn duyệt ảnh',
    statusCls: mode === 'approved' ? 'tag t-ok' : 'tag t-butter',
    isPending: mode === 'pending',
    isEditing: mode === 'editing',
    isApproved: mode === 'approved',
    isSent: mode === 'sent',
    approve: () => setState({ mode: 'approved' }),
    askEdit: () => setState({ mode: 'editing' }),
    cancelEdit: () => setState({ mode: 'pending' }),
    sendEdit: () => setState({ mode: 'sent' }),
    editText: st.editText,
    onEdit: (e) => setState({ editText: e.target.value }),
    noop: (e) => {
      if (e && e.preventDefault) e.preventDefault();
    },
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
          onSubmit={vals.noop}
        >
          <div className="field" style={{ flex: '1 1 320px', maxWidth: '520px' }}>
            <label htmlFor="tq">Số điện thoại hoặc mã đơn</label>
            <input id="tq" className="input" value="CH-0001" onChange={vals.noop} />
          </div>
          <button type="button" className="btn btn-ink btn-lg">
            Tra cứu
          </button>
        </form>
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
                  <span className="hlg">CH-0001</span>
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
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
                  gap: '12px',
                }}
              >
                <div
                  className="ph"
                  style={{
                    aspectRatio: '1 / 1',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  <Icon name="image" className="ic ic-24" />
                  <span className="bsm">[Ảnh shop gửi, góc chính diện]</span>
                </div>
                <div
                  className="ph"
                  style={{
                    aspectRatio: '1 / 1',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                >
                  <Icon name="image" className="ic ic-24" />
                  <span className="bsm">[Ảnh shop gửi, cận cảnh]</span>
                </div>
              </div>
              {vals.isPending ? (
                <>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-ink btn-lg" onClick={vals.approve}>
                      <Icon name="check" />
                      Xác nhận, shop giao hàng
                    </button>
                    <button type="button" className="btn btn-line btn-lg" onClick={vals.askEdit}>
                      Yêu cầu chỉnh sửa
                    </button>
                  </div>
                  <p className="cap">
                    Chỉ khi bạn xác nhận, shop mới giao cho đơn vị vận chuyển. Bạn cũng có thể nhắn qua Zalo
                    hoặc Messenger.
                  </p>
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
                      <button type="button" className="btn btn-ink" onClick={vals.sendEdit}>
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
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                  <div style={{ position: 'absolute', width: '80px', left: '-4px', top: '-2px' }}>
                    <Chibi hair="long" outfitColor="#c9484f" accessory="bouquet" />
                  </div>
                </div>
                <div style={{ flex: '1', minWidth: '0' }}>
                  <div className="bsm" style={{ fontWeight: '600' }}>
                    Cặp đôi áo dài
                  </div>
                  <div className="cap">Hộp gỗ chibi, 2 nhân vật</div>
                </div>
              </div>
              <hr className="hr" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="cap">Người nhận</span>
                <span className="bsm" style={{ fontWeight: '500' }}>
                  Huy, [SĐT]
                </span>
                <span className="bsm mut">[Địa chỉ nhận hàng]</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="flabel">Tổng tạm tính</span>
                <span className="hh">763.000đ</span>
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
              <span className="bsm">Chat với shop để chỉnh sửa hoặc hỏi thêm về đơn.</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href="#" className="btn btn-ink">
                  Chat Zalo
                </a>
                <a href="#" className="btn btn-line">
                  Messenger
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
