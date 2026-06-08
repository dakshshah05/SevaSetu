import { Award, Gift, Clock } from "lucide-react";

export default function RewardsStore({
  user,
  vouchers,
  claims,
  onRedeemVoucher,
  onOpenAuthModal
}) {
  const userClaims = claims.filter(c => user && c.volunteerId === user.uid);

  return (
    <div className="card card-teal gsap-reveal">
      <div className="info-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Gift style={{ color: "var(--color-green-dark)" }} />
          <h3>Seva Rewards Marketplace</h3>
        </div>
        <div className="user-points-badge" style={{ fontSize: "13px", padding: "8px 16px", background: "rgba(231, 225, 177, 0.4)", border: "1px solid var(--color-beige-dark)" }}>
          <Award size={14} style={{ marginRight: "4px" }} />
          <span style={{ fontWeight: "bold", color: "var(--color-green-dark)" }}>
            {user?.role === "volunteer" ? `${user.rewardPoints || 0} Points Available` : "Guest Balance: 0 Points"}
          </span>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Convert your civic contributions and volunteering hours into real-world incentives. Our corporate partners offer discount vouchers as a token of gratitude for your service.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "10px" }}>
        {vouchers.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", gridColumn: "1/-1", textAlign: "center", padding: "30px" }}>No reward vouchers currently listed.</p>
        ) : (
          vouchers.map(v => {
            const hasPoints = user && (user.rewardPoints || 0) >= v.pointsCost;
            return (
              <div key={v.id} className="card card-orange" style={{ background: "rgba(251, 245, 221, 0.4)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px", border: "1px solid var(--color-beige-dark)" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <img 
                      src={v.image} 
                      alt={v.partner} 
                      style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--color-beige-dark)" }} 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100"; }}
                    />
                    <span className="badge badge-pending" style={{ fontWeight: "700", fontSize: "12px" }}>
                      {v.pointsCost} Pts
                    </span>
                  </div>
                  <h4 style={{ color: "var(--color-green-dark)" }}>{v.partner}</h4>
                  <h5 style={{ fontSize: "13px", marginTop: "2px", fontWeight: "600" }}>{v.title}</h5>
                  <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "1.4" }}>{v.description}</p>
                </div>

                {user?.role === "volunteer" ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onRedeemVoucher(v.id)} 
                    style={{ width: "100%", padding: "8px", fontSize: "12px", fontWeight: "bold" }}
                    disabled={!hasPoints}
                  >
                    {hasPoints ? "Redeem Voucher" : "Insufficient Points"}
                  </button>
                ) : (
                  <button 
                    className="btn btn-outline" 
                    onClick={onOpenAuthModal} 
                    style={{ width: "100%", padding: "8px", fontSize: "12px" }}
                  >
                    Login to Claim
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Redeemed list */}
      <div className="card card-orange" style={{ marginTop: "32px", background: "rgba(231, 225, 177, 0.2)", border: "1px dashed var(--color-beige-dark)" }}>
        <h4 style={{ color: "var(--color-green-dark)", marginBottom: "4px" }}>Claimed Promo Codes</h4>
        <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "16px" }}>Use these coupon codes at checkout with our retail partners.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {userClaims.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", fontStyle: "italic", textAlign: "center", padding: "12px" }}>
              No coupons claimed yet. Complete civic tasks to earn reward points!
            </p>
          ) : (
            userClaims.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", background: "rgba(251, 245, 221, 0.6)", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-beige-dark)" }}>
                <div>
                  <h5 style={{ fontSize: "13px", color: "var(--color-green-dark)" }}>{c.partner} - {c.voucherTitle}</h5>
                  <span style={{ fontSize: "9px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                    <Clock size={10} /> Redeemed on {new Date(c.date).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <code style={{ fontSize: "12px", background: "rgba(13, 83, 14, 0.1)", color: "var(--color-green-dark)", padding: "4px 8px", borderRadius: "4px", border: "1px dashed var(--color-green-medium)", fontWeight: "bold" }}>
                    {c.code}
                  </code>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
