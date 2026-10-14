import Link from 'next/link';
import { requireSection } from '@/lib/auth-session';
import { getAllLeadersAdmin } from '@/lib/content';
import { buildDashboard, getAllLeads, getVoiceCounts, greeting, todayLabel } from '@/lib/admin-stats';
import RecentLeadsTable from '@/components/admin/RecentLeadsTable';
import ActivityStrip from '@/components/admin/dashboard/ActivityStrip';
import TrendChart from '@/components/admin/dashboard/TrendChart';
import PipelineBars from '@/components/admin/dashboard/PipelineBars';
import RadialStat from '@/components/admin/dashboard/RadialStat';
import MixGauge from '@/components/admin/dashboard/MixGauge';
import { IconInbox, IconPlus } from '@/components/admin/AdminIcons';
import styles from '@/components/admin/dashboard/dashboard.module.css';

const FOUNDING_TARGET = 50;

export default async function AdminDashboardPage() {
  const session = await requireSection('dashboard');

  const [leads, leaders, voices] = await Promise.all([getAllLeads(), getAllLeadersAdmin(), getVoiceCounts()]);
  const dashboard = buildDashboard(leads, leaders);

  const total = leads.length;
  const newCount = leads.filter((l) => l.status === 'new').length;
  const approvedCount = leads.filter((l) => l.status === 'approved').length;
  const liveLeaders = leaders.filter((l) => l.published).length;
  const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);

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
    {
      title: 'Founding 50',
      caption: 'seats filled',
      value: liveLeaders,
      percent: pct(liveLeaders, FOUNDING_TARGET),
      color: '#F25F5C',
      colorTo: '#FFB3B1',
      href: '/admin/leaders',
    },
    {
      title: 'Voices',
      caption: 'published',
      value: voices.total,
      percent: pct(voices.published, voices.total),
      color: '#FFB547',
      colorTo: '#FFE2AE',
      href: '/admin/voices',
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
              ? `${newCount} new application${newCount > 1 ? 's' : ''} waiting for review.`
              : 'Your inbox is clear. Here’s how the community is growing.'}
          </p>
        </div>
        <div className={styles.helloActions}>
          <Link href="/admin/leads" className={`${styles.btn} ${styles.btnGhost}`}>
            <IconInbox size={16} /> Review inbox
          </Link>
          <Link href="/admin/leaders" className={`${styles.btn} ${styles.btnPrimary}`}>
            <IconPlus size={16} /> Add leader
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.full}>
          <ActivityStrip items={dashboard.activity} />
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
