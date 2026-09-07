"use client";

import { useState } from "react";
import { css, cx } from "styled-system/css";
import { Check, ChevronRight, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api, type AdminCategory, type AdminSkill } from "@/lib/api";
import { useAdminAction, useCategories, useSkills } from "./queries";
import { useToast } from "./toast";
import { Btn, ErrorState, IconBtn, Input, Loading, Modal, Panel, PanelHead, Pill, page, PageHeader, row, searchWrap, stack, text } from "./ui";
import { errorMessage } from "./format";

const catRow = css({
  display: "flex", alignItems: "center", gap: "10px", px: "16px", h: "44px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)",
  "&:last-child": { borderBottom: "none" }, _hover: { bg: "var(--td-surface-2)" },
  "&[data-parent=true]": { bg: "var(--td-surface-2)", fontWeight: 600 },
  "&[data-child=true]": { pl: "40px" },
  "&[data-off=true] .name": { color: "var(--td-ink-3)", textDecoration: "line-through" },
  "& .tools": { marginLeft: "auto", display: "flex", gap: "2px", visibility: "hidden" },
  "&:hover .tools": { visibility: "visible" },
});
const toggle = css({
  w: "30px", h: "18px", borderRadius: "999px", bg: "var(--td-line-2)", border: "none", position: "relative", cursor: "pointer", transition: "background-color .15s", flexShrink: 0,
  "&::after": { content: '""', position: "absolute", top: "2px", left: "2px", w: "14px", h: "14px", borderRadius: "999px", bg: "#fff", transition: "transform .15s", boxShadow: "0 1px 2px rgba(0,0,0,.2)" },
  "&[data-on=true]": { bg: "var(--td-green)" }, "&[data-on=true]::after": { transform: "translateX(12px)" },
  _disabled: { opacity: 0.5, cursor: "wait" },
});
const skillRow = css({ display: "flex", alignItems: "center", gap: "10px", px: "16px", h: "42px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", "&:last-child": { borderBottom: "none" }, _hover: { bg: "var(--td-surface-2)" }, "& .tools": { marginLeft: "auto", visibility: "hidden" }, "&:hover .tools": { visibility: "visible" } });
const disabledBtn = css({ _disabled: { opacity: 0.35, cursor: "not-allowed" } });

export default function CatalogPage() {
  const toast = useToast();
  const categories = useCategories();
  const skills = useSkills();
  const [newTop, setNewTop] = useState("");
  const [adding, setAdding] = useState<number | null>(null);
  const [addName, setAddName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [del, setDel] = useState<AdminCategory | null>(null);
  const [skillQ, setSkillQ] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [busy, setBusy] = useState(false);

  const cats = categories.data ?? [];
  const allSkills = skills.data ?? [];
  const parents = cats.filter((c) => c.parent_id === null);
  const children = (id: number) => cats.filter((c) => c.parent_id === id);
  const listings = (c: AdminCategory) => (c.parent_id === null ? children(c.id).reduce((a, x) => a + (x.services_count ?? 0), c.services_count ?? 0) : c.services_count ?? 0);
  const filteredSkills = allSkills.filter((s) => s.expertise_name.toLowerCase().includes(skillQ.trim().toLowerCase()));

  const act = useAdminAction(async ({ fn }: { fn: () => Promise<unknown> }) => fn());
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try { await act.mutateAsync({ fn }); if (ok) toast(ok); return true; }
    catch (err) { toast(errorMessage(err), "error"); return false; }
    finally { setBusy(false); }
  };

  const commitAdd = async (parentId: number | null) => {
    const name = (parentId === null ? newTop : addName).trim();
    if (!name) return;
    if (await run(() => api.createAdminCategory(name, parentId), `Added “${name}”.`)) {
      if (parentId === null) setNewTop(""); else { setAdding(null); setAddName(""); }
    }
  };
  const commitEdit = async () => {
    if (editing == null || !editName.trim()) return;
    if (await run(() => api.updateAdminCategory(editing, { category_name: editName.trim() }), "Renamed.")) setEditing(null);
  };
  const toggleActive = (c: AdminCategory) => run(() => api.updateAdminCategory(c.id, { is_active: !c.is_active }), c.is_active ? `“${c.category_name}” hidden from the site.` : `“${c.category_name}” is visible again.`);
  const confirmDelete = async () => {
    if (!del) return;
    if (await run(() => api.deleteAdminCategory(del.id), `Deleted “${del.category_name}”.`)) setDel(null);
  };
  const commitSkill = async () => {
    const n = newSkill.trim();
    if (!n) return;
    if (allSkills.some((s) => s.expertise_name.toLowerCase() === n.toLowerCase())) { toast("That skill already exists.", "info"); return; }
    if (await run(() => api.createAdminSkill(n), `Added “${n}”.`)) setNewSkill("");
  };
  const removeSkill = (s: AdminSkill) => run(() => api.deleteAdminSkill(s.id), `Removed “${s.expertise_name}”.`);

  const Row = ({ c }: { c: AdminCategory }) => {
    const isParent = c.parent_id === null;
    const n = listings(c);
    const kids = isParent ? children(c.id).length : 0;
    // Deleting a category cascades to its services, so only empty ones can go.
    const blocked = n > 0 ? "Move its listings first" : kids > 0 ? "Delete its subcategories first" : "Delete";
    return (
      <div className={catRow} data-parent={isParent} data-child={!isParent} data-off={!c.is_active}>
        {isParent ? <ChevronRight size={14} className={css({ color: "var(--td-ink-3)" })} /> : null}
        {editing === c.id ? (
          <>
            <Input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(null); }} className={css({ h: "30px", maxW: "280px" })} />
            <Btn size="xs" variant="primary" onClick={commitEdit} disabled={busy}><Check size={12} /> Save</Btn>
            <Btn size="xs" variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
          </>
        ) : (
          <>
            <span className="name">{c.category_name}</span>
            <span className={text({ size: "sm", tone: 3 })}>{n ? `${n} listing${n === 1 ? "" : "s"}` : isParent ? `${kids} ${kids === 1 ? "subcategory" : "subcategories"}` : "empty"}</span>
            {!c.is_active ? <Pill tone="neutral">Hidden</Pill> : null}
            <span className="tools">
              {isParent ? <Btn size="xs" variant="ghost" onClick={() => { setAdding(c.id); setAddName(""); }}><Plus size={12} /> Subcategory</Btn> : null}
              <IconBtn size="sm" title="Rename" onClick={() => { setEditing(c.id); setEditName(c.category_name); }}><Pencil size={14} /></IconBtn>
              <IconBtn size="sm" title={blocked} disabled={n > 0 || kids > 0} className={disabledBtn} onClick={() => setDel(c)}><Trash2 size={14} /></IconBtn>
            </span>
            <button className={toggle} data-on={c.is_active} disabled={busy} title={c.is_active ? "Shown to users" : "Hidden from users"} onClick={() => toggleActive(c)} aria-label="Toggle visibility" />
          </>
        )}
      </div>
    );
  };

  return (
    <div className={page}>
      <PageHeader title="Catalog" description="Categories organise listings on the site. Skills are the tags freelancers pick for their profile." />
      <div className={css({ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "20px", alignItems: "start" })}>
        <Panel>
          <PanelHead title="Categories" meta={categories.data ? `${parents.length} groups · ${cats.length - parents.length} subcategories` : undefined} />
          <div className={cx(row({ gap: 2 }), css({ p: "12px 16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", bg: "var(--td-surface-2)" }))}>
            <Input placeholder="New top-level group, e.g. Music & Audio" value={newTop} onChange={(e) => setNewTop(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitAdd(null)} />
            <Btn variant="primary" disabled={!newTop.trim() || busy} onClick={() => commitAdd(null)}><Plus size={14} /> Add group</Btn>
          </div>
          {categories.isLoading ? <Loading /> : categories.isError ? <ErrorState onRetry={() => categories.refetch()} /> : parents.length === 0 ? <p className={cx(text({ size: "sm", tone: 3 }), css({ p: "20px" }))}>No categories yet. Add a top-level group to start.</p> : parents.map((p) => (
            <div key={p.id}>
              <Row c={p} />
              {children(p.id).map((c) => <Row key={c.id} c={c} />)}
              {adding === p.id ? (
                <div className={cx(catRow, css({ pl: "40px", bg: "var(--td-accent-soft)" }))}>
                  <Input autoFocus placeholder={`New subcategory under ${p.category_name}`} value={addName} onChange={(e) => setAddName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") commitAdd(p.id); if (e.key === "Escape") setAdding(null); }} className={css({ h: "30px", maxW: "320px" })} />
                  <Btn size="xs" variant="primary" disabled={!addName.trim() || busy} onClick={() => commitAdd(p.id)}>Add</Btn>
                  <IconBtn size="sm" onClick={() => setAdding(null)}><X size={14} /></IconBtn>
                </div>
              ) : null}
            </div>
          ))}
        </Panel>

        <Panel>
          <PanelHead title="Skills" meta={skills.data ? String(allSkills.length) : undefined} />
          <div className={cx(stack({ gap: 2 }), css({ p: "12px 16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", bg: "var(--td-surface-2)" }))}>
            <div className={row({ gap: 2 })}>
              <Input placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitSkill()} />
              <Btn variant="primary" disabled={!newSkill.trim() || busy} onClick={commitSkill}><Plus size={14} /></Btn>
            </div>
            <div className={searchWrap}><Search size={14} /><Input placeholder="Filter skills" value={skillQ} onChange={(e) => setSkillQ(e.target.value)} className={css({ h: "32px" })} /></div>
          </div>
          <div className={css({ maxH: "560px", overflowY: "auto" })}>
            {skills.isLoading ? <Loading /> : skills.isError ? <ErrorState onRetry={() => skills.refetch()} /> : filteredSkills.length === 0 ? <div className={cx(text({ size: "sm", tone: 3 }), css({ p: "16px" }))}>{allSkills.length ? "No skill matches." : "No skills yet."}</div> : filteredSkills.map((s) => {
              const used = s.freelancer_profiles_count ?? 0;
              return (
                <div key={s.id} className={skillRow}>
                  <span className={text({ weight: 500 })}>{s.expertise_name}</span>
                  <span className={text({ size: "sm", tone: 3 })}>{used ? `${used} ${used === 1 ? "freelancer" : "freelancers"}` : "unused"}</span>
                  <span className="tools"><IconBtn size="sm" title={used ? "In use on freelancer profiles" : "Delete"} disabled={used > 0 || busy} className={disabledBtn} onClick={() => removeSkill(s)}><Trash2 size={14} /></IconBtn></span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Modal open={!!del} onClose={() => setDel(null)} title={`Delete “${del?.category_name}”?`} description="It's empty, so nothing else is affected. Listings can't be filed under it any more." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Keep it</Btn><Btn variant="danger" disabled={busy} onClick={confirmDelete}>{busy ? "Deleting…" : "Delete"}</Btn></>} />
    </div>
  );
}
