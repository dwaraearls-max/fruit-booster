export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="bg-gold-pale">
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
        <h1 className="text-3xl font-black text-plum md:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-plum/60">
          Last Updated: September 2, 2026 — Compliant with Ghana Data Protection Act, 2012 (Act 843)
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-plum/80">
          <section>
            <h2 className="text-xl font-bold text-plum">1. Introduction</h2>
            <p className="mt-3">
              Welcome to Fruit Booster — For Healthy Living. Your privacy is important to us. We collect
              and protect your information under the Ghana Data Protection Act, 2012 (Act 843).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">2. Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Full name, phone, email, and delivery address (region, town, Ghana Post GPS)</li>
              <li>
                Payment info: Mobile Money (MTN MoMo, Telecel, AT) and cards via Paystack. We{" "}
                <strong className="font-semibold text-plum">never</strong> store your MoMo PIN.
              </li>
              <li>Order history: exotic fruits, tropical fruits, smoothies, and juice boxes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">3. Why We Collect</h2>
            <p className="mt-3">
              To process and deliver your fresh fruit blended orders, confirm MoMo payments, manage your
              account, send updates, and prevent fraud. You can opt out of promotions at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">4. Mobile Money</h2>
            <p className="mt-3">
              Payments are processed by MTN, Telecel, and AT. We only receive payment confirmation. We{" "}
              <strong className="font-semibold text-plum">never</strong> ask for your PIN. Never share your
              PIN with riders.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">5. Sharing</h2>
            <p className="mt-3">
              We <strong className="font-semibold text-plum">do not</strong> sell your data. We share
              information only with:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Delivery riders (name, phone, and address needed for delivery)</li>
              <li>Payment providers</li>
              <li>Hosting providers</li>
              <li>When required by law or the Data Protection Commission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">6. Cookies &amp; Security</h2>
            <p className="mt-3">
              We use cookies for your cart and login. We use SSL encryption and secure servers to protect
              your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">7. Data Retention</h2>
            <p className="mt-3">
              We keep your data while your account is active. Transaction records are kept for 6 years for
              GRA requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-plum">8. Your Rights Under Act 843</h2>
            <p className="mt-3">
              You have the right to know, access, correct, and delete your data; to object to marketing;
              and to complain to the Data Protection Commission of Ghana.
            </p>
            <p className="mt-4">
              Privacy contact:{" "}
              <a
                href="mailto:fruitbooster6@gmail.com"
                className="font-semibold text-plum underline-offset-4 hover:underline"
              >
                fruitbooster6@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
