'use client';

import { useMemo, useState, useTransition } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase-client';
import { createAdminUser, deleteAdminUser, updateAdminUser } from '../controllers/users.actions';
import { ADMIN_SECTIONS, AdminRole, AdminSection, ALL_SECTIONS, ROLE_LABEL } from '@/modules/auth/models/access.model';
import type { AdminUser } from '../models/user.model';
import { IconClose, IconPlus, IconSearch, IconShield, IconUser } from '@/components/admin/AdminIcons';
import { avatarGradient, initials } from '@/components/admin/avatar';
import styles from './UsersManager.module.css';

type Row = AdminUser & { lastSeen: string; addedBy: string | null };

interface Draft {
  mode: 'create' | 'edit';
  email: string;
  name: string;
  role: AdminRole;
  sections: AdminSection[];
  active: boolean;
  sendSetupEmail: boolean;
}

const emptyDraft = (): Draft => ({
  mode: 'create',
  email: '',
  name: '',
  role: 'admin',
  sections: ['dashboard'],
  active: true,
  sendSetupEmail: true,
});

const ROLE_HELP: Record<AdminRole, string> = {
  admin: 'Only the sections you choose below.',
  superadmin: 'Everything, including adding users and changing access.',
};

export default function UsersManager({
  users,
  currentEmail,
  canWrite,
}: {
  users: Row[];
  currentEmail: string;
  canWrite: boolean;
}) {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q));
  }, [users, query]);

  const counts = {
    superadmin: users.filter((u) => u.role === 'superadmin').length,
    admin: users.filter((u) => u.role === 'admin').length,
    disabled: users.filter((u) => !u.active).length,
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast((t) => (t === message ? '' : t)), 5000);
  };

  const openEdit = (u: Row) => {
    setFormError('');
    setDraft({
      mode: 'edit',
      email: u.email,
      name: u.name,
      role: u.role,
      sections: u.role === 'superadmin' ? ALL_SECTIONS : u.sections,
      active: u.active,
      sendSetupEmail: false,
    });
  };

  const toggleSection = (key: AdminSection) =>
    setDraft((d) =>
      d && { ...d, sections: d.sections.includes(key) ? d.sections.filter((s) => s !== key) : [...d.sections, key] },
    );

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setFormError('');

    startTransition(async () => {
      const access = { name: draft.name, role: draft.role, sections: draft.sections };
      const result =
        draft.mode === 'create'
          ? await createAdminUser({ ...access, email: draft.email })
          : await updateAdminUser(draft.email, { ...access, active: draft.active });

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      let message = draft.mode === 'create' ? `${draft.email} can now sign in with Google.` : `Access updated for ${draft.name}.`;
      if (draft.mode === 'create' && draft.sendSetupEmail) {
        try {
          await sendPasswordResetEmail(auth, draft.email.trim().toLowerCase());
          message = `${draft.email} can now sign in with Google, and we’ve emailed them a link to set a password.`;
        } catch (err) {
          console.warn('Could not send password setup email:', err);
          message = `${draft.email} was added, but the password email couldn’t be sent. They can use “Forgot or first time?” on the sign-in page.`;
        }
      }
      setDraft(null);
      flash(message);
    });
  };

  const setActive = (u: Row, active: boolean) =>
    startTransition(async () => {
      const result = await updateAdminUser(u.email, { name: u.name, role: u.role, sections: u.sections, active });
      flash(result.success ? `${u.name} ${active ? 'can sign in again' : 'has been disabled'}.` : result.error);
    });

  const remove = (u: Row) =>
    startTransition(async () => {
      const result = await deleteAdminUser(u.email);
      setConfirmRemove(null);
      flash(result.success ? `${u.name} no longer has access.` : result.error);
    });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <span className={styles.eyebrow}>
            <IconShield size={14} /> Super admin
          </span>
          <h1>Users &amp; Access</h1>
          <p>Invite teammates and choose exactly which parts of the console they can use.</p>
        </div>
        <button
          type="button"
          className={styles.primary}
          onClick={() => {
            setFormError('');
            setDraft(emptyDraft());
          }}
          disabled={!canWrite}
        >
          <IconPlus size={16} /> Invite user
        </button>
      </header>

      {!canWrite && (
        <p className={styles.notice}>
          Firestore isn’t connected on this machine, so users can’t be added or changed here. Add the service-account
          credentials to <code>.env.local</code>, or manage users on the live site.
        </p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat} style={{ '--c': '#2F6BFF', '--i': 0 } as React.CSSProperties}>
          <strong>{counts.superadmin}</strong>
          <span>Super admins</span>
        </div>
        <div className={styles.stat} style={{ '--c': '#8B6CFF', '--i': 1 } as React.CSSProperties}>
          <strong>{counts.admin}</strong>
          <span>Admins</span>
        </div>
        <div className={styles.stat} style={{ '--c': '#A5AABB', '--i': 2 } as React.CSSProperties}>
          <strong>{counts.disabled}</strong>
          <span>Disabled</span>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search users"
            />
          </label>
          <span className={styles.count}>{filtered.length} people</span>
        </div>

        <ul className={styles.list}>
          {filtered.map((u, i) => {
            const isMe = u.email === currentEmail;
            const locked = u.builtIn || isMe;
            return (
              <li
                key={u.email}
                className={`${styles.row} ${u.active ? '' : styles.rowDisabled}`}
                style={{ '--i': i } as React.CSSProperties}
              >
                <span className={styles.avatar} style={{ background: avatarGradient(u.email) }}>
                  {initials(u.name)}
                </span>

                <div className={styles.who}>
                  <strong>
                    {u.name}
                    {isMe && <span className={styles.you}>You</span>}
                  </strong>
                  <span>{u.email}</span>
                </div>

                <div className={styles.access}>
                  <span className={`${styles.role} ${u.role === 'superadmin' ? styles.roleSuper : ''}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                  {u.role === 'superadmin' ? (
                    <span className={styles.chip}>Full access</span>
                  ) : (
                    ADMIN_SECTIONS.filter((s) => u.sections.includes(s.key)).map((s) => (
                      <span key={s.key} className={styles.chip}>
                        {s.label}
                      </span>
                    ))
                  )}
                  {u.builtIn && <span className={styles.builtIn}>Built-in</span>}
                </div>

                <div className={styles.meta}>
                  <span className={`${styles.status} ${u.active ? styles.statusOn : ''}`}>
                    {u.active ? 'Active' : 'Disabled'}
                  </span>
                  <small>{u.lastSeen}</small>
                </div>

                <div className={styles.actions}>
                  {locked ? (
                    <span className={styles.lockedNote}>{u.builtIn ? 'Managed in code' : '—'}</span>
                  ) : confirmRemove === u.email ? (
                    <>
                      <button type="button" className={styles.danger} onClick={() => remove(u)} disabled={isPending}>
                        Remove
                      </button>
                      <button type="button" className={styles.ghost} onClick={() => setConfirmRemove(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className={styles.ghost} onClick={() => openEdit(u)} disabled={!canWrite}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.ghost}
                        onClick={() => setActive(u, !u.active)}
                        disabled={!canWrite || isPending}
                      >
                        {u.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className={styles.ghostDanger}
                        onClick={() => setConfirmRemove(u.email)}
                        disabled={!canWrite}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && <li className={styles.empty}>No users match “{query}”.</li>}
        </ul>
      </section>

      {/* ---------- Invite / edit drawer ---------- */}
      {draft && (
        <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && !isPending && setDraft(null)}>
          <form className={styles.drawer} onSubmit={save} aria-label={draft.mode === 'create' ? 'Invite user' : 'Edit user'}>
            <header className={styles.drawerHead}>
              <div>
                <h2>{draft.mode === 'create' ? 'Invite a user' : `Edit ${draft.name}`}</h2>
                <p>{draft.mode === 'create' ? 'They’ll sign in with this email address.' : draft.email}</p>
              </div>
              <button type="button" className={styles.close} onClick={() => setDraft(null)} aria-label="Close">
                <IconClose size={18} />
              </button>
            </header>

            <div className={styles.drawerBody}>
              {formError && (
                <p className={styles.formError} role="alert">
                  {formError}
                </p>
              )}

              <label className={styles.field}>
                <span>Full name</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                />
              </label>

              {draft.mode === 'create' && (
                <label className={styles.field}>
                  <span>Email address</span>
                  <input
                    type="email"
                    required
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="name@company.com"
                  />
                </label>
              )}

              <fieldset className={styles.fieldset}>
                <legend>Role</legend>
                <div className={styles.roleGrid}>
                  {(['admin', 'superadmin'] as AdminRole[]).map((role) => (
                    <label key={role} className={`${styles.roleCard} ${draft.role === role ? styles.roleCardOn : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        checked={draft.role === role}
                        onChange={() =>
                          setDraft({
                            ...draft,
                            role,
                            sections: role === 'superadmin' ? ALL_SECTIONS : draft.sections,
                          })
                        }
                      />
                      <span className={styles.roleIcon}>{role === 'superadmin' ? <IconShield size={18} /> : <IconUser size={18} />}</span>
                      <strong>{ROLE_LABEL[role]}</strong>
                      <small>{ROLE_HELP[role]}</small>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className={styles.fieldset} disabled={draft.role === 'superadmin'}>
                <legend>Section access</legend>
                <div className={styles.sectionList}>
                  {ADMIN_SECTIONS.map((s) => {
                    const on = draft.role === 'superadmin' || draft.sections.includes(s.key);
                    return (
                      <label key={s.key} className={`${styles.sectionItem} ${on ? styles.sectionOn : ''}`}>
                        <span className={styles.sectionText}>
                          <strong>{s.label}</strong>
                          <small>{s.description}</small>
                        </span>
                        <input type="checkbox" checked={on} onChange={() => toggleSection(s.key)} />
                        <span className={styles.switch} aria-hidden="true" />
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {draft.mode === 'edit' ? (
                <label className={`${styles.sectionItem} ${draft.active ? styles.sectionOn : ''}`}>
                  <span className={styles.sectionText}>
                    <strong>Account active</strong>
                    <small>Disabled users are signed out and can’t sign back in.</small>
                  </span>
                  <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                  <span className={styles.switch} aria-hidden="true" />
                </label>
              ) : (
                <label className={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={draft.sendSetupEmail}
                    onChange={(e) => setDraft({ ...draft, sendSetupEmail: e.target.checked })}
                  />
                  Email them a link to set a password (Google sign-in works either way)
                </label>
              )}
            </div>

            <footer className={styles.drawerFoot}>
              <button type="button" className={styles.ghost} onClick={() => setDraft(null)} disabled={isPending}>
                Cancel
              </button>
              <button type="submit" className={styles.primary} disabled={isPending}>
                {isPending ? 'Saving…' : draft.mode === 'create' ? 'Send invite' : 'Save changes'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
