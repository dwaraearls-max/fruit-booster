export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 prose prose-plum">
      <h1 className="text-3xl font-black">Privacy Policy</h1>
      <p className="mt-4 text-plum/80">
        Fruit Booster respects your privacy. We collect only the information needed to fulfil your order:
        name, phone, delivery address, and payment confirmation. We never sell your data.
      </p>
    </div>
  );
}
