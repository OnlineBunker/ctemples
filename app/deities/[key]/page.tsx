import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTemplesByDeity } from "@/lib/temples";
import { DEITY_ORDER, DEITY_META, type DeityKey } from "@/lib/deities";
import { DeityIcon } from "@/components/brand/deity-icons";
import { Section } from "@/components/ui/section";
import { TempleCard, templeToCard } from "@/components/ui/temple-card";

/**
 * Editorial notes for each deity — factual, encyclopedic descriptions (no fabricated
 * statistics, D12). `blurb` = who they are; `iconography` = how to read their images.
 */
const DEITY_CONTENT: Record<DeityKey, { blurb: string; iconography: string }> = {
  shiva: {
    blurb:
      "The great ascetic and lord of destruction and renewal, Shiva is worshipped across India as the linga, as Nataraja the cosmic dancer, and at the twelve Jyotirlingas — self-manifest shrines of light.",
    iconography: "The trishul (trident), the crescent moon, the third eye, the serpent Vasuki, and the bull Nandi.",
  },
  vishnu: {
    blurb:
      "The preserver of the cosmos, Vishnu is honoured through his many avatars — Rama, Krishna, Venkateswara, Jagannath — in some of the most-visited temples on earth.",
    iconography: "The chakra (discus) and shankha (conch), the mace, the lotus, and the cosmic serpent Ananta.",
  },
  devi: {
    blurb:
      "The Goddess in all her forms — Parvati, Durga, Kali, and the local ammans — is shakti, the active power of the universe, enthroned at the Shakti Peethas.",
    iconography: "The lotus, the trident, the lion or tiger mount, and weapons borne in many arms.",
  },
  ganesha: {
    blurb:
      "The elephant-headed remover of obstacles and lord of beginnings, Ganesha is invoked first at nearly every rite and at the threshold of every doorway.",
    iconography: "The ankusha (goad), the noose, the single broken tusk, the modaka sweet, and the mouse mount.",
  },
  murugan: {
    blurb:
      "The youthful warrior god and son of Shiva, Murugan (Kartikeya) is especially beloved in the Tamil country, worshipped across his six sacred abodes.",
    iconography: "The vel (divine spear), the peacock mount, and the rooster banner.",
  },
  hanuman: {
    blurb:
      "The devoted vanara and boundless servant of Rama, Hanuman is the guardian of strength, courage, and unwavering devotion.",
    iconography: "The gada (mace), a mountain borne aloft, and the torn chest revealing Rama within the heart.",
  },
};

export function generateStaticParams() {
  return DEITY_ORDER.map((key) => ({ key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const meta = DEITY_META[key as DeityKey];
  if (!meta) return {};
  return {
    title: `${meta.label} temples`,
    description: `Temples of ${meta.label} across India — ${DEITY_CONTENT[key as DeityKey].blurb}`.slice(0, 155),
  };
}

/**
 * /deities/[key] — a deity monograph (docs/15 §2G). The line-drawn deity icon at hero
 * scale (stroke-draw on load) over a plum sanctum, then signature temples as unified
 * cards and an iconography note. Six locked keys (D11); anything else 404s.
 */
export default async function DeityPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(DEITY_ORDER as string[]).includes(key)) notFound();
  const dkey = key as DeityKey;
  const meta = DEITY_META[dkey];
  const content = DEITY_CONTENT[dkey];
  const temples = await getTemplesByDeity(dkey);

  return (
    <>
      <Section surface="sanctum">
        <Link
          href="/deities"
          className="inline-flex items-center gap-1.5 font-mono text-label uppercase tracking-label text-turmeric transition-colors hover:text-porcelain"
        >
          ← The pantheon
        </Link>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,38%)_minmax(0,62%)]">
          <div className="flex justify-center">
            <span
              className="inline-flex h-40 w-40 items-center justify-center rounded-portal"
              style={{ color: meta.accent, backgroundColor: `${meta.accent}22` }}
            >
              <DeityIcon icon={meta.icon} className="h-24 w-24" animated />
            </span>
          </div>
          <div>
            <p className="font-mono text-label uppercase tracking-label text-turmeric">Deity</p>
            <h1 className="mt-3 font-display text-display-xl font-semibold">{meta.label}</h1>
            <p className="mt-5 text-body-lg leading-relaxed text-porcelain/80">{content.blurb}</p>
          </div>
        </div>
      </Section>

      <Section surface="canvas">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <h2 className="font-display text-display-md font-semibold text-plum">
              {temples.length > 0 ? `Temples of ${meta.label}` : `${meta.label} temples`}
            </h2>
            {temples.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {temples.map((t, i) => (
                  <TempleCard key={t.id} temple={templeToCard(t)} priority={i === 0} />
                ))}
              </div>
            ) : (
              <p className="mt-6 text-body-lg leading-relaxed text-ink-muted">
                No {meta.label} temples are documented yet —{" "}
                <Link href="/suggest" className="font-semibold text-magenta hover:underline">
                  suggest one
                </Link>
                .
              </p>
            )}
          </div>
          <aside className="lg:pt-16">
            <div className="rounded-card border border-line bg-surface-recess p-6">
              <h3 className="font-mono text-label uppercase tracking-label text-magenta-deep">Iconography</h3>
              <p className="mt-3 text-body-sm leading-relaxed text-ink-muted">{content.iconography}</p>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
