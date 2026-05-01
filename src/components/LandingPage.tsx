import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bot, Zap, Shield, BarChart3, MessageSquare, Upload,
  Check, Star, ArrowRight, Sparkles, Globe, Clock, Users,
  ChevronDown, Play,
} from "lucide-react";
import "../LandingPage.css";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

/* ─── Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const dots: { x: number; y: number; vx: number; vy: number; r: number }[] = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148,163,184,0.4)"; ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 130) {
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(148,163,184,${0.15 * (1 - dist / 130)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

/* ─── Typing effect ─── */
function TypingText({ phrases }: { phrases: string[] }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const target = phrases[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % phrases.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, phrases]);
  return <span className="typing-text">{displayed}<span className="cursor">|</span></span>;
}

/* ─── Animated counter ─── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1800, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <div ref={ref}>{prefix}{count.toLocaleString()}{suffix}</div>;
}

/* ─── Live chat mockup ─── */
function ChatMockup() {
  const messages = [
    { from: "user", text: "How do I reset my password?" },
    { from: "bot", text: "Sure! Go to Settings → Security → Reset Password. You'll get an email within 30 seconds." },
    { from: "user", text: "What payment methods do you accept?" },
    { from: "bot", text: "We accept Visa, Mastercard, PayPal and UPI. All transactions are secured by Stripe." },
  ];
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    if (visible >= messages.length) return;
    const t = setTimeout(() => setVisible(v => v + 1), visible === 0 ? 800 : 1200);
    return () => clearTimeout(t);
  }, [visible]);
  return (
    <div className="chat-mockup">
      <div className="chat-mockup-header">
        <div className="chat-mockup-dot" style={{ background: "#ef4444" }} />
        <div className="chat-mockup-dot" style={{ background: "#f59e0b" }} />
        <div className="chat-mockup-dot" style={{ background: "#22c55e" }} />
        <span className="chat-mockup-title">ChatAgent · Support Bot</span>
        <span className="chat-mockup-status"><span className="status-dot" />Online</span>
      </div>
      <div className="chat-mockup-body">
        <div className="chat-mockup-intro">
          <div className="bot-avatar-sm"><Bot className="w-4 h-4" /></div>
          <div className="chat-bubble-bot">Hi! I'm your AI support agent. How can I help?</div>
        </div>
        {messages.slice(0, visible).map((m, i) => (
          <div key={i} className={`chat-msg chat-msg--${m.from}`}>
            {m.from === "bot" && <div className="bot-avatar-sm"><Bot className="w-3 h-3" /></div>}
            <div className={`chat-bubble-${m.from}`}>{m.text}</div>
          </div>
        ))}
        {visible < messages.length && (
          <div className="chat-msg chat-msg--bot">
            <div className="bot-avatar-sm"><Bot className="w-3 h-3" /></div>
            <div className="chat-bubble-bot typing-indicator"><span /><span /><span /></div>
          </div>
        )}
      </div>
      <div className="chat-mockup-footer">
        <input readOnly placeholder="Type a message…" className="chat-input-mock" />
        <button className="chat-send-mock"><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

/* ─── Bento Feature Card ─── */
function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bento-card ${className}`}>{children}</div>;
}

/* ─── Testimonial ─── */
function Testimonial({ quote, name, role, color, initials }: { quote: string; name: string; role: string; color: string; initials: string }) {
  return (
    <div className="testimonial-card-v2">
      <div className="testimonial-stars-v2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5" fill="currentColor" />)}</div>
      <p className="testimonial-quote-v2">"{quote}"</p>
      <div className="testimonial-author-v2">
        <div className="testimonial-avatar-v2" style={{ background: color }}>{initials}</div>
        <div><p className="testimonial-name-v2">{name}</p><p className="testimonial-role-v2">{role}</p></div>
      </div>
    </div>
  );
}

/* ─── Pricing Card ─── */
function PricingCard({ plan, price, desc, features, highlight, badge, onCta }: {
  plan: string; price: string; desc: string; features: string[];
  highlight?: boolean; badge?: string; onCta: () => void;
}) {
  return (
    <div className={`pricing-card-v2 ${highlight ? "pricing-card-v2--highlight" : ""}`}>
      {badge && <div className="pricing-badge-v2">{badge}</div>}
      <p className="pricing-plan-v2">{plan}</p>
      <div className="pricing-price-v2"><span className="pricing-dollar">$</span>{price}<span className="pricing-mo">/mo</span></div>
      <p className="pricing-desc-v2">{desc}</p>
      <ul className="pricing-list-v2">
        {features.map((f, i) => (
          <li key={i}><Check className="w-4 h-4 pricing-check-v2" />{f}</li>
        ))}
      </ul>
      <button onClick={onCta} className={highlight ? "pricing-cta-highlight" : "pricing-cta"}>
        Get Started <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Main ─── */
export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleScroll = useCallback(() => setScrollY(window.scrollY), []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className={`lp-nav ${scrollY > 40 ? "lp-nav--blur" : ""}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-mark"><Bot className="w-4 h-4 text-white" /></div>
            <span className="lp-logo-text">ChatAgent</span>
          </div>
          <ul className="lp-links">
            {["Features", "How it Works", "Pricing"].map(l => (
              <li key={l}><a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className="lp-link">{l}</a></li>
            ))}
          </ul>
          <div className="lp-nav-cta">
            <button onClick={onLogin} className="lp-signin">Sign in</button>
            <button onClick={onGetStarted} className="lp-cta-btn">Start free <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
            <span className={menuOpen ? "h-open-1" : ""} /><span className={menuOpen ? "h-open-2" : ""} /><span className={menuOpen ? "h-open-3" : ""} />
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mobile-menu">
            {["Features", "How it Works", "Pricing"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className="lp-mobile-link" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <div className="lp-mobile-cta">
              <button onClick={onLogin} className="lp-signin w-full">Sign in</button>
              <button onClick={onGetStarted} className="lp-cta-btn w-full">Start free</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <ParticleCanvas />
        <div className="lp-hero-glow lp-hero-glow--1" />
        <div className="lp-hero-glow lp-hero-glow--2" />
        <div className="lp-hero-glow lp-hero-glow--3" />

        <div className="lp-hero-inner">
          <div className="lp-hero-left">
            <div className="lp-badge">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by GPT-4o &amp; Claude 3.5</span>
            </div>
            <h1 className="lp-hero-title">
              AI support that<br />
              <TypingText phrases={["never sleeps.", "scales instantly.", "knows your docs.", "delights customers."]} />
            </h1>
            <p className="lp-hero-sub">
              Build document-aware chatbots in minutes — no code, no complexity.
              Just upload, configure, and go live.
            </p>
            <div className="lp-hero-actions">
              <button onClick={onGetStarted} className="lp-btn-primary">
                <Play className="w-4 h-4" fill="white" /> Start building — it's free
              </button>
              <button onClick={onLogin} className="lp-btn-ghost">
                Sign in <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="lp-social-proof">
              <div className="lp-avatars">
                {["S","R","A","M","J"].map((l, i) => <div key={i} className={`lp-av lp-av--${i+1}`} style={{ marginLeft: i ? -10 : 0 }}>{l}</div>)}
              </div>
              <p><strong>2,000+</strong> teams trust ChatAgent</p>
            </div>
          </div>
          <div className="lp-hero-right">
            <ChatMockup />
            <div className="lp-hero-badge lp-hero-badge--tl">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>~180ms avg response</span>
            </div>
            <div className="lp-hero-badge lp-hero-badge--br">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SOC 2 compliant</span>
            </div>
          </div>
        </div>

        <div className="lp-scroll-hint">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats-bar">
        <div className="lp-stats-inner">
          {[
            { val: 2000, suf: "+", label: "Companies" },
            { val: 50, suf: "M+", label: "Messages/month" },
            { val: 99, suf: ".9%", label: "Uptime" },
            { val: 4, pre: "", suf: ".9 / 5 ★", label: "Avg rating" },
          ].map(({ val, suf, label, pre }) => (
            <div key={label} className="lp-stat">
              <div className="lp-stat-num"><AnimatedCounter target={val} suffix={suf} prefix={pre} /></div>
              <div className="lp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES BENTO */}
      <section id="features" className="lp-section lp-section--dark">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-eyebrow">Features</div>
            <h2 className="lp-section-title">Built for scale.<br /><span className="lp-grad">Designed for simplicity.</span></h2>
          </div>
          <div className="bento-grid">
            <BentoCard className="bento-large">
              <div className="bento-icon-wrap bento-blue"><Upload className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">Document Intelligence</h3>
              <p className="bento-desc">Upload PDFs, DOCX, URLs, or paste raw text. Our RAG pipeline indexes everything in seconds and keeps your bot accurate and grounded.</p>
              <div className="bento-tags">
                {["PDF", "DOCX", "Web URLs", "Plain Text", "Notion"].map(t => <span key={t} className="bento-tag">{t}</span>)}
              </div>
            </BentoCard>

            <BentoCard className="bento-tall">
              <div className="bento-icon-wrap bento-violet"><Zap className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">Lightning Responses</h3>
              <p className="bento-desc">Sub-200ms responses. Stream tokens as they generate for a native feel.</p>
              <div className="bento-latency">
                <div className="bento-bar-wrap">
                  {[80, 120, 95, 170, 110, 90, 140].map((h, i) => (
                    <div key={i} className="bento-bar" style={{ height: h / 2, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <p className="bento-bar-label">avg 145ms latency</p>
              </div>
            </BentoCard>

            <BentoCard>
              <div className="bento-icon-wrap bento-emerald"><Shield className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">Enterprise Security</h3>
              <p className="bento-desc">End-to-end encryption, RBAC, and SOC 2 Type II certified.</p>
            </BentoCard>

            <BentoCard>
              <div className="bento-icon-wrap bento-orange"><BarChart3 className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">Rich Analytics</h3>
              <p className="bento-desc">CSAT scores, deflection rates, and funnel insights in one dashboard.</p>
            </BentoCard>

            <BentoCard>
              <div className="bento-icon-wrap bento-pink"><Globe className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">50+ Languages</h3>
              <p className="bento-desc">Auto-detects and responds in your customer's language — zero config.</p>
            </BentoCard>

            <BentoCard className="bento-wide">
              <div className="bento-icon-wrap bento-cyan"><Clock className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">24 / 7 Availability</h3>
              <p className="bento-desc">Your AI never takes a sick day. It handles thousands of simultaneous conversations with consistent quality, around the clock.</p>
              <div className="bento-uptime-row">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="uptime-block" style={{ opacity: Math.random() > 0.05 ? 1 : 0.2 }} />
                ))}
                <span className="uptime-label">99.9% last 30 days</span>
              </div>
            </BentoCard>

            <BentoCard>
              <div className="bento-icon-wrap bento-rose"><MessageSquare className="w-6 h-6 text-white" /></div>
              <h3 className="bento-title">Human Handoff</h3>
              <p className="bento-desc">Seamlessly escalate to a human agent when the AI isn't confident enough.</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="lp-section lp-section--mid">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-eyebrow lp-eyebrow--light">How it Works</div>
            <h2 className="lp-section-title lp-section-title--light">Live in <span className="lp-grad">3 steps</span></h2>
          </div>
          <div className="steps-v2">
            {[
              { n: "01", icon: Bot, title: "Create your bot", desc: "Name it, set a personality and system prompt that matches your brand." },
              { n: "02", icon: Upload, title: "Upload knowledge", desc: "Drag in PDFs, docs, or paste URLs. Our AI indexes everything automatically." },
              { n: "03", icon: Zap, title: "Deploy & iterate", desc: "Go live instantly. Refine based on analytics and customer feedback." },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="step-v2">
                <div className="step-v2-num">{n}</div>
                {i < 2 && <div className="step-v2-line" />}
                <div className="step-v2-card">
                  <div className="step-v2-icon"><Icon className="w-5 h-5 text-sky-400" /></div>
                  <h3 className="step-v2-title">{title}</h3>
                  <p className="step-v2-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="lp-section lp-section--dark">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-eyebrow">Testimonials</div>
            <h2 className="lp-section-title">Trusted by <span className="lp-grad">builders</span></h2>
          </div>
          <div className="testimonials-v2">
            <Testimonial quote="ChatAgent cut our ticket volume by 60% in month one. Onboarding took 20 minutes." name="Sarah Chen" role="Head of Support, Acme Inc." color="linear-gradient(135deg,#f43f5e,#fb923c)" initials="SC" />
            <Testimonial quote="Trained on 200+ docs. Our bot answers better than some human agents. Incredible tech." name="Marcus Williams" role="CTO, Shopframe" color="linear-gradient(135deg,#3b82f6,#6366f1)" initials="MW" />
            <Testimonial quote="The analytics dashboard is gold. Finally we know what customers actually ask about." name="Priya Sharma" role="Product, Paylance" color="linear-gradient(135deg,#10b981,#0ea5e9)" initials="PS" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="lp-section lp-section--mid">
        <div className="lp-section-inner">
          <div className="lp-section-header">
            <div className="lp-eyebrow lp-eyebrow--light">Pricing</div>
            <h2 className="lp-section-title lp-section-title--light">Simple, <span className="lp-grad">honest</span> pricing</h2>
            <p className="lp-section-sub">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="pricing-v2-grid">
            <PricingCard plan="Starter" price="0" desc="For individuals & side projects"
              features={["1 chatbot","100 msgs/month","5 document uploads","Community support"]}
              onCta={onGetStarted} />
            <PricingCard plan="Pro" price="29" desc="For growing teams"
              features={["10 chatbots","10,000 msgs/month","Unlimited docs","Advanced analytics","Priority support","Custom branding"]}
              highlight badge="Most Popular" onCta={onGetStarted} />
            <PricingCard plan="Enterprise" price="99" desc="For scaled organizations"
              features={["Unlimited chatbots","Unlimited msgs","SSO & SAML","Dedicated CSM","SLA guarantee","On-premise option"]}
              onCta={onGetStarted} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-section">
        <div className="lp-cta-glow-1" /><div className="lp-cta-glow-2" />
        <div className="lp-cta-inner">
          <div className="lp-cta-icon"><Users className="w-8 h-8 text-white" /></div>
          <h2 className="lp-cta-title">Ready to transform support?</h2>
          <p className="lp-cta-sub">Join 2,000+ teams. No credit card required.</p>
          <button onClick={onGetStarted} className="lp-btn-primary lp-btn-primary--lg">
            <Play className="w-4 h-4" fill="white" /> Start building for free
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo"><div className="lp-logo-mark"><Bot className="w-4 h-4 text-white" /></div><span className="lp-logo-text">ChatAgent</span></div>
            <p className="lp-footer-tag">AI support, simplified.</p>
          </div>
          {[
            { title: "Product", links: ["Features","Pricing","Changelog","Roadmap"] },
            { title: "Company", links: ["About","Blog","Careers","Press"] },
            { title: "Legal", links: ["Privacy","Terms","Security","DPA"] },
          ].map(col => (
            <div key={col.title} className="lp-footer-col">
              <p className="lp-footer-col-title">{col.title}</p>
              {col.links.map(l => <a key={l} href="#" className="lp-footer-link">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <p>© {new Date().getFullYear()} ChatAgent, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
