import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Zap,
  Shield,
  BarChart3,
  MessageSquare,
  Upload,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Sparkles,
  Globe,
  Clock,
  Users,
} from "lucide-react";
import heroIllustration from "../assets/hero-illustration.png";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// ---------- Animated counter ----------
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ---------- Feature Card ----------
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="feature-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`feature-icon-wrap ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{description}</p>
    </div>
  );
}

// ---------- Testimonial Card ----------
function TestimonialCard({
  quote,
  name,
  role,
  avatar,
  rating,
}: {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}) {
  return (
    <div className="testimonial-card">
      <div className="testimonial-stars">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4" fill="currentColor" />
        ))}
      </div>
      <p className="testimonial-quote">"{quote}"</p>
      <div className="testimonial-author">
        <div className="testimonial-avatar">{avatar}</div>
        <div>
          <p className="testimonial-name">{name}</p>
          <p className="testimonial-role">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- Pricing Card ----------
function PricingCard({
  plan,
  price,
  period,
  description,
  features,
  highlighted,
  badge,
  onGetStarted,
}: {
  plan: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  onGetStarted: () => void;
}) {
  return (
    <div className={`pricing-card ${highlighted ? "pricing-card--highlight" : ""}`}>
      {badge && <div className="pricing-badge">{badge}</div>}
      <div className="pricing-header">
        <h3 className="pricing-plan">{plan}</h3>
        <div className="pricing-price">
          <span className="pricing-currency">$</span>
          <span className="pricing-amount">{price}</span>
          <span className="pricing-period">/{period}</span>
        </div>
        <p className="pricing-desc">{description}</p>
      </div>
      <ul className="pricing-features">
        {features.map((f, i) => (
          <li key={i} className="pricing-feature-item">
            <Check className="w-4 h-4 pricing-check" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onGetStarted}
        className={highlighted ? "pricing-btn-highlight" : "pricing-btn"}
      >
        Get Started
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---------- Main Landing Page ----------
export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navScrolled = scrollY > 50;

  return (
    <div className="landing-root">
      {/* ── NAV ── */}
      <nav className={`landing-nav ${navScrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="landing-logo-text">ChatAgent</span>
          </div>

          {/* Desktop links */}
          <ul className="landing-nav-links">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="landing-nav-link"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div className="landing-nav-cta">
            <button onClick={onLogin} className="nav-btn-ghost">
              Sign In
            </button>
            <button onClick={onGetStarted} className="nav-btn-primary">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--open-1" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--open-2" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "hamburger-line--open-3" : ""}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="mobile-menu-link"
                onClick={() => setMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="mobile-menu-cta">
              <button onClick={onLogin} className="nav-btn-ghost w-full">Sign In</button>
              <button onClick={onGetStarted} className="nav-btn-primary w-full">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* Animated background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Customer Support Platform</span>
          </div>

          <h1 className="hero-title">
            Build Smarter{" "}
            <span className="hero-title-gradient">AI Chatbots</span>
            <br />
            in Minutes
          </h1>

          <p className="hero-subtitle">
            Deploy intelligent, document-aware chatbots that understand your
            business and delight your customers — no coding required.
          </p>

          <div className="hero-actions">
            <button onClick={onGetStarted} className="hero-btn-primary">
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onLogin} className="hero-btn-ghost">
              Sign In
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              {["S", "R", "A", "M", "J"].map((letter, i) => (
                <div
                  key={i}
                  className="hero-avatar"
                  style={{ zIndex: 5 - i, marginLeft: i === 0 ? 0 : -10 }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="hero-social-text">
              <strong>2,000+</strong> businesses trust ChatAgent
            </p>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-glow" />
          <img
            src={heroIllustration}
            alt="AI Neural Network Visualization"
            className="hero-img"
          />
          {/* Floating chat bubbles */}
          <div className="hero-float hero-float-1">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span>Instant replies</span>
          </div>
          <div className="hero-float hero-float-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>99.9% uptime</span>
          </div>
          <div className="hero-float hero-float-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>50+ languages</span>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="stats-band">
        <div className="stats-grid">
          {[
            { value: 2000, suffix: "+", label: "Businesses" },
            { value: 50, suffix: "M+", label: "Messages Sent" },
            { value: 99, suffix: ".9%", label: "Uptime SLA" },
            { value: 4.9, suffix: "/5", label: "Avg Rating", isFloat: true },
          ].map(({ value, suffix, label, isFloat }) => (
            <div key={label} className="stat-item">
              <p className="stat-number">
                {isFloat ? (
                  <>4.9{suffix}</>
                ) : (
                  <AnimatedCounter target={value} suffix={suffix} />
                )}
              </p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="section-light">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">Features</div>
            <h2 className="section-title">
              Everything you need to{" "}
              <span className="gradient-text">scale support</span>
            </h2>
            <p className="section-subtitle">
              From intelligent document parsing to real-time analytics —
              ChatAgent gives you the full stack.
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={Upload}
              title="Document Intelligence"
              description="Upload PDFs, docs, and web pages. Your chatbot learns from your content instantly with RAG-powered retrieval."
              gradient="gradient-blue"
              delay={0}
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast Responses"
              description="Sub-second AI responses powered by the latest LLMs. Your customers never wait."
              gradient="gradient-violet"
              delay={100}
            />
            <FeatureCard
              icon={Shield}
              title="Enterprise Security"
              description="SOC 2 compliant, end-to-end encrypted, with role-based access control built in."
              gradient="gradient-emerald"
              delay={200}
            />
            <FeatureCard
              icon={BarChart3}
              title="Rich Analytics"
              description="Real-time dashboards showing conversation volume, resolution rates, and customer satisfaction."
              gradient="gradient-orange"
              delay={300}
            />
            <FeatureCard
              icon={Globe}
              title="Multilingual Support"
              description="Communicate in 50+ languages. ChatAgent auto-detects and responds in your customer's language."
              gradient="gradient-pink"
              delay={400}
            />
            <FeatureCard
              icon={Clock}
              title="24/7 Availability"
              description="Never miss a customer query. Your AI assistant works around the clock without breaks."
              gradient="gradient-cyan"
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section-dark">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow section-eyebrow--light">How It Works</div>
            <h2 className="section-title section-title--light">
              Up and running in{" "}
              <span className="gradient-text">3 simple steps</span>
            </h2>
          </div>

          <div className="steps-container">
            {[
              {
                step: "01",
                title: "Create Your Chatbot",
                desc: "Give your chatbot a name, personality, and a system prompt. Customize it to match your brand voice.",
                icon: Bot,
              },
              {
                step: "02",
                title: "Upload Your Knowledge",
                desc: "Drop in your docs, FAQs, product guides, or URLs. Our AI processes and indexes everything automatically.",
                icon: Upload,
              },
              {
                step: "03",
                title: "Deploy & Delight",
                desc: "Embed on your site or use our hosted link. Watch your AI handle customer queries instantly.",
                icon: Zap,
              },
            ].map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} className="step-item">
                <div className="step-connector">
                  <div className="step-number">{step}</div>
                  {i < 2 && <div className="step-line" />}
                </div>
                <div className="step-content">
                  <div className="step-icon-wrap">
                    <Icon className="w-6 h-6 text-sky-400" />
                  </div>
                  <h3 className="step-title">{title}</h3>
                  <p className="step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="section-light">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">Testimonials</div>
            <h2 className="section-title">
              Loved by <span className="gradient-text">thousands</span>
            </h2>
          </div>

          <div className="testimonials-grid">
            <TestimonialCard
              quote="ChatAgent cut our support ticket volume by 60% in the first month. The setup was ridiculously simple."
              name="Sarah Chen"
              role="Head of Support @ Vercel-like startup"
              avatar="SC"
              rating={5}
            />
            <TestimonialCard
              quote="We trained our bot on 200+ docs and it answers customer questions better than some of our human agents."
              name="Marcus Williams"
              role="CTO @ E-commerce brand"
              avatar="MW"
              rating={5}
            />
            <TestimonialCard
              quote="The analytics dashboard alone is worth it. We finally understand what our customers are asking about."
              name="Priya Sharma"
              role="Product Manager @ SaaS company"
              avatar="PS"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-dark">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow section-eyebrow--light">Pricing</div>
            <h2 className="section-title section-title--light">
              Simple, <span className="gradient-text">transparent</span> pricing
            </h2>
            <p className="section-subtitle section-subtitle--light">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="pricing-grid">
            <PricingCard
              plan="Starter"
              price="0"
              period="mo"
              description="Perfect for individuals and small projects"
              features={[
                "1 chatbot",
                "100 messages / month",
                "5 document uploads",
                "Community support",
              ]}
              onGetStarted={onGetStarted}
            />
            <PricingCard
              plan="Pro"
              price="29"
              period="mo"
              description="For growing teams that need more power"
              features={[
                "10 chatbots",
                "10,000 messages / month",
                "Unlimited document uploads",
                "Advanced analytics",
                "Priority support",
                "Custom branding",
              ]}
              highlighted
              badge="Most Popular"
              onGetStarted={onGetStarted}
            />
            <PricingCard
              plan="Enterprise"
              price="99"
              period="mo"
              description="For organizations with advanced needs"
              features={[
                "Unlimited chatbots",
                "Unlimited messages",
                "SSO & advanced security",
                "Dedicated account manager",
                "SLA guarantee",
                "On-premise option",
              ]}
              onGetStarted={onGetStarted}
            />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section">
        <div className="cta-orb-1" />
        <div className="cta-orb-2" />
        <div className="cta-content">
          <div className="cta-icon-wrap">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="cta-title">
            Ready to transform your customer support?
          </h2>
          <p className="cta-subtitle">
            Join 2,000+ businesses delivering exceptional AI-powered support.
            No credit card required.
          </p>
          <div className="cta-actions">
            <button onClick={onGetStarted} className="hero-btn-primary">
              Start for Free — it's instant
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">
              <div className="landing-logo-icon">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className="landing-logo-text">ChatAgent</span>
            </div>
            <p className="footer-tagline">AI-powered customer support, simplified.</p>
          </div>

          <div className="footer-links-group">
            <p className="footer-links-title">Product</p>
            <a href="#features" className="footer-link">Features</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
          </div>

          <div className="footer-links-group">
            <p className="footer-links-title">Company</p>
            <a href="#" className="footer-link">About</a>
            <a href="#" className="footer-link">Blog</a>
            <a href="#" className="footer-link">Careers</a>
          </div>

          <div className="footer-links-group">
            <p className="footer-links-title">Legal</p>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Security</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ChatAgent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
