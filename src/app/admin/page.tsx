import Link from 'next/link';
import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext } from '@/features/sites/admin-site';
import { getAllSpeakersAdmin } from '@/features/speakers/server';
import { buildDashboard, getAllLeads, greeting, todayLabel } from '@/features/dashboard/stats';
import { siteIdOf } from '@/features/sites/constants';
import RecentLeadsTable from '@/features/leads/components/RecentLeadsTable';
import LeadSources from '@/features/dashboard/components/LeadSources';
import TrendChart from '@/features/dashboard/components/TrendChart';
import PipelineBars from '@/features/dashboard/components/PipelineBars';
import RadialStat from '@/features/dashboard/components/RadialStat';
import MixGauge from '@/features/dashboard/components/MixGauge';
import { IconInbox, IconPlus } from '@/components/admin/AdminIcons';
import styles from '@/features/dashboard/components/dashboard.module.css';


export default async function AdminDashboardPage() {
  const session = await requireSection('dashboard');
  const { site } = await getAdminSiteContext();
  const hasSpeakers = Boolean(site?.modules.includes('leaders'));

  const [allLeads, speakers] = await Promise.all([
    getAllLeads(),
    hasSpeakers && site ? getAllSpeakersAdmin(site.id) : Promise.resolve([]),
  ]);
  // A website shows its own leads; "All websites" shows every lead.
  const leads = site ? allLeads.filter((l) => siteIdOf(l) === site.id) : allLeads;
  const dashboard = buildDashboard(leads);

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === 'new').length;
  const approvedCount = leads.filter((l) => l.status === 'approved').length;
  const liveSpeakers = speakers.filter((l) => l.published).length;
  const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);
  // Leads from the last 30 days, already bucketed for the mix chart.
  const thisMonth = dashboard.mix.month.reduce((n, slice) => n + slice.count, 0);
  const partners = leads.filter((l) => l.type === 'partner').length;

  const radials = [
    {
      title: 'Applications',
      caption: 'reviewed',
      value: total,
      percent: pct(total - newCount, total),
      color: '#8B6CFF',
      colorTo: '#C9BBFF',
      href: '/admin/leads',
    },
    hasSpeakers
      ? {
          title: 'CMO Speakers',
          caption: 'published',
          value: liveSpeakers,
          percent: pct(liveSpeakers, speakers.length),
          color: '#F25F5C',
          colorTo: '#FFB3B1',
          href: '/admin/speakers',
        }
      : {
          title: 'This month',
          caption: 'of all leads',
          value: thisMonth,
          percent: pct(thisMonth, total),
          color: '#F25F5C',
          colorTo: '#FFB3B1',
          href: '/admin/leads',
        },
    {
      title: 'Partners',
      caption: 'of all leads',
      value: partners,
      percent: pct(partners, total),
      color: '#FFB547',
      colorTo: '#FFE2AE',
      href: '/admin/leads',
    },
    {
      title: 'Approved',
      caption: 'approval rate',
      value: approvedCount,
      percent: pct(approvedCount, total),
      color: '#FF8A3D',
      colorTo: '#FFC8A2',
      href: '/admin/leads',
    },
  ];

  const firstName = session.name.split(' ')[0] || session.email.split('@')[0];
  const scope = site ? site.name : 'all your websites';

  return (
    <div className={styles.page}>
      <div className={`${styles.hello} ${styles.reveal}`}>
        <div>
          <span className={styles.helloEyebrow}>
            <span className={styles.liveDot} /> {todayLabel()}
          </span>
          <h1>
            {greeting()}, <span>{firstName}</span>
          </h1>
          <p>
            {newCount > 0
              ? `${newCount} new application${newCount > 1 ? 's' : ''} waiting for review on ${scope}.`
              : `Your inbox is clear. Here’s how ${scope} ${site ? 'is' : 'are'} growing.`}
          </p>
        </div>
        <div className={styles.helloActions}>
          <Link href="/admin/leads" className={`${styles.btn} ${styles.btnGhost}`}>
            <IconInbox size={16} /> Review inbox
          </Link>
          {hasSpeakers && (
            <Link href="/admin/speakers" className={`${styles.btn} ${styles.btnPrimary}`}>
              <IconPlus size={16} /> Add speaker
            </Link>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.full}>
          <LeadSources sources={dashboard.sources} />
        </div>

        <TrendChart series={dashboard.trend} />
        <PipelineBars pipeline={dashboard.pipeline} />

        <section className={`${styles.card} ${styles.radials}`}>
          {radials.map((r, i) => (
            <RadialStat key={r.title} index={i} {...r} />
          ))}
        </section>
        <MixGauge mix={dashboard.mix} />

        <div className={`${styles.full} ${styles.reveal}`} style={{ '--d': 7 } as React.CSSProperties}>
          <RecentLeadsTable leads={leads.slice(0, 25)} />
        </div>
      </div>
    </div>
  );
}
