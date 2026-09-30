"use client";

import { useState } from "react";
import { css, cx } from "styled-system/css";
import { Check, ChevronRight, FolderInput, Inbox, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api, type AdminCategory, type AdminSkill, type UnsortedCategoryRow } from "@/lib/api";
import { useAdminAction, useCategories, useSkills, useUnsorted } from "./queries";
import { useToast } from "./toast";
import { Btn, ErrorState, Field, IconBtn, Input, Loading, Modal, Panel, PanelHead, Pill, Select, page, PageHeader, row, searchWrap, stack, text } from "./ui";
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
const unsortedRow = css({ display: "flex", alignItems: "center", gap: "14px", px: "16px", minH: "52px", py: "8px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", "&:last-child": { borderBottom: "none" }, _hover: { bg: "var(--td-surface-2)" }, "& .actions": { marginLeft: "auto", display: "flex", gap: "6px", flexShrink: 0 } });
const crumb = css({ color: "var(--td-ink-3)", fontWeight: 400 });
const disabledBtn = css({ _disabled: { opacity: 0.35, cursor: "not-allowed" } });

const listingsNoun = (r: UnsortedCategoryRow) => {
  const parts: string[] = [];
  if (r.services_count) parts.push(`${r.services_count} ${r.services_count === 1 ? "service" : "services"}`);
  if (r.job_posts_count) parts.push(`${r.job_posts_count} ${r.job_posts_count === 1 ? "job post" : "job posts"}`);
  return parts.join(" · ");
};
const totalOf = (r: UnsortedCategoryRow) => r.services_count + r.job_posts_count;

export default function CatalogPage() {
  const toast = useToast();
  const categories = useCategories();
  const unsorted = useUnsorted();
  const skills = useSkills();
  const [newTop, setNewTop] = useState("");
  const [adding, setAdding] = useState<number | null>(null);
  const [addName, setAddName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [del, setDel] = useState<AdminCategory | null>(null);
  const [promote, setPromote] = useState<{ row: UnsortedCategoryRow; name: string; parentId: string } | null>(null);
  const [file, setFile] = useState<{ row: UnsortedCategoryRow; categoryId: string } | null>(null);
  const [skillQ, setSkillQ] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [busy, setBusy] = useState(false);

  const cats = categories.data ?? [];
  const allSkills = skills.data ?? [];
  const parents = cats.filter((c) => c.parent_id === null);
  const realParents = parents.filter((c) => !c.is_catch_all);
  const children = (id: number) => cats.filter((c) => c.parent_id === id);
  const listings = (c: AdminCategory) => (c.parent_id === null ? children(c.id).reduce((a, x) => a + (x.services_count ?? 0), c.services_count ?? 0) : c.services_count ?? 0);
  const filteredSkills = allSkills.filter((s) => s.expertise_name.toLowerCase().includes(skillQ.trim().toLowerCase()));
  const rows = unsorted.data ?? [];

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

  // Sorting an owner label: either it becomes a subcategory of its own, or it joins one that exists.
  const openPromote = (r: UnsortedCategoryRow) => setPromote({ row: r, name: r.label, parentId: r.group && !r.group.is_catch_all ? String(r.group.id) : "" });
  const openFile = (r: UnsortedCategoryRow) => setFile({ row: r, categoryId: "" });
  const movedMsg = (res: { category: AdminCategory; moved: { services: number; job_posts: number } }) => {
    const n = res.moved.services + res.moved.job_posts;
    const parent = cats.find((c) => c.id === res.category.parent_id);
    return `Moved ${n} ${n === 1 ? "listing" : "listings"} to ${parent ? `${parent.category_name} › ` : ""}${res.category.category_name}.`;
  };
  const confirmPromote = async () => {
    if (!promote || !promote.name.trim() || !promote.parentId) return;
    const { row, name, parentId } = promote;
    setBusy(true);
    try {
      const res = await api.promoteUnsorted({ group_id: row.group_id, label: row.label, parent_id: Number(parentId), name: name.trim() });
      await act.mutateAsync({ fn: async () => undefined });
      toast(movedMsg(res)); setPromote(null);
    } catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusy(false); }
  };
  const confirmFile = async () => {
    if (!file || !file.categoryId) return;
    const { row, categoryId } = file;
    setBusy(true);
    try {
      const res = await api.fileUnsorted({ group_id: row.group_id, label: row.label, category_id: Number(categoryId) });
      await act.mutateAsync({ fn: async () => undefined });
      toast(movedMsg(res)); setFile(null);
    } catch (err) { toast(errorMessage(err), "error"); }
    finally { setBusy(false); }
  };

  const Row = ({ c }: { c: AdminCategory }) => {
    const isParent = c.parent_id === null;
    const n = listings(c);
    const kids = isParent ? children(c.id).length : 0;
    // Deleting a category cascades to its services, so only empty ones can go; the catch-all never goes.
    const blocked = c.is_catch_all ? "Where unsorted listings land. Can't be deleted" : n > 0 ? "Move its listings first" : kids > 0 ? "Delete its subcategories first" : "Delete";
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
            <span className={text({ size: "meta", tone: 3 })}>{n ? `${n} listing${n === 1 ? "" : "s"}` : isParent ? (c.is_catch_all ? "for listings that fit no group" : `${kids} ${kids === 1 ? "subcategory" : "subcategories"}`) : "empty"}</span>
            {c.is_catch_all ? <Pill tone="neutral">Catch-all</Pill> : null}
            {!c.is_active ? <Pill tone="neutral">Hidden</Pill> : null}
            <span className="tools">
              {isParent && !c.is_catch_all ? <Btn size="xs" variant="ghost" onClick={() => { setAdding(c.id); setAddName(""); }}><Plus size={12} /> Subcategory</Btn> : null}
              <IconBtn size="sm" title="Rename" onClick={() => { setEditing(c.id); setEditName(c.category_name); }}><Pencil size={14} /></IconBtn>
              <IconBtn size="sm" title={blocked} disabled={c.is_catch_all || n > 0 || kids > 0} className={disabledBtn} onClick={() => setDel(c)}><Trash2 size={14} /></IconBtn>
            </span>
            <button className={toggle} data-on={c.is_active} disabled={busy} title={c.is_active ? "Shown to users" : "Hidden from users"} onClick={() => toggleActive(c)} aria-label="Toggle visibility" />
          </>
        )}
      </div>
    );
  };

  const shelfOptions = (
    <>
      <option value="">Choose…</option>
      {realParents.map((p) => (
        <optgroup key={p.id} label={p.category_name}>{children(p.id).map((c) => <option key={c.id} value={c.id}>{c.category_name}</option>)}</optgroup>
      ))}
    </>
  );

  return (
    <div className={page}>
      <PageHeader title="Catalog" description="Categories organise listings on the site. Owners who don't find a fit type their own words; sort those here. Skills are the tags freelancers pick for their profile." />

      {unsorted.isError ? <div className={css({ mb: "20px" })}><ErrorState title="Couldn't load unsorted listings" onRetry={() => unsorted.refetch()} /></div> : rows.length > 0 ? (
        <Panel className={css({ mb: "20px" })}>
          <PanelHead title="Not yet sorted" meta={`${rows.length} ${rows.length === 1 ? "label" : "labels"} owners typed themselves`} />
          {rows.map((r) => (
            <div key={`${r.group_id}|${r.label.toLowerCase()}`} className={unsortedRow}>
              <Inbox size={16} className={css({ color: "var(--td-ink-3)", flexShrink: 0 })} />
              <div className={css({ minW: 0 })}>
                <p className={text({ weight: 600 })}><span className={crumb}>{r.group?.category_name ?? "Unknown group"} › </span>{r.label}</p>
                <p className={text({ size: "meta", tone: 3 })}>{listingsNoun(r)}</p>
              </div>
              <span className="actions">
                <Btn size="xs" variant="primary" disabled={busy} onClick={() => openPromote(r)}><Plus size={12} /> Make it a subcategory</Btn>
                <Btn size="xs" disabled={busy} onClick={() => openFile(r)}><FolderInput size={12} /> File under…</Btn>
              </span>
            </div>
          ))}
        </Panel>
      ) : null}

      <div className={css({ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: "20px", alignItems: "start" })}>
        <Panel>
          <PanelHead title="Categories" meta={categories.data ? `${realParents.length} groups · ${cats.length - parents.length} subcategories` : undefined} />
          <div className={cx(row({ gap: 2 }), css({ p: "12px 16px", borderBottomWidth: "1px", borderBottomStyle: "solid", borderBottomColor: "var(--td-line)", bg: "var(--td-surface-2)" }))}>
            <Input placeholder="New top-level group, e.g. Music & Audio" value={newTop} onChange={(e) => setNewTop(e.target.value)} onKeyDown={(e) => e.key === "Enter" && commitAdd(null)} />
            <Btn variant="primary" disabled={!newTop.trim() || busy} onClick={() => commitAdd(null)}><Plus size={14} /> Add group</Btn>
          </div>
          {categories.isLoading ? <Loading /> : categories.isError ? <ErrorState onRetry={() => categories.refetch()} /> : parents.length === 0 ? <p className={cx(text({ size: "meta", tone: 3 }), css({ p: "20px" }))}>No categories yet. Add a top-level group to start.</p> : parents.map((p) => (
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
            {skills.isLoading ? <Loading /> : skills.isError ? <ErrorState onRetry={() => skills.refetch()} /> : filteredSkills.length === 0 ? <div className={cx(text({ size: "meta", tone: 3 }), css({ p: "16px" }))}>{allSkills.length ? "No skill matches." : "No skills yet."}</div> : filteredSkills.map((s) => {
              const used = s.freelancer_profiles_count ?? 0;
              return (
                <div key={s.id} className={skillRow}>
                  <span className={text({ weight: 500 })}>{s.expertise_name}</span>
                  <span className={text({ size: "meta", tone: 3 })}>{used ? `${used} ${used === 1 ? "freelancer" : "freelancers"}` : "unused"}</span>
                  <span className="tools"><IconBtn size="sm" title={used ? "In use on freelancer profiles" : "Delete"} disabled={used > 0 || busy} className={disabledBtn} onClick={() => removeSkill(s)}><Trash2 size={14} /></IconBtn></span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Modal open={!!del} onClose={() => setDel(null)} title={`Delete “${del?.category_name}”?`} description="It's empty, so nothing else is affected. Listings can't be filed under it any more." size="sm"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Keep it</Btn><Btn variant="danger" disabled={busy} onClick={confirmDelete}>{busy ? "Deleting…" : "Delete"}</Btn></>} />

      <Modal open={!!promote} onClose={() => setPromote(null)} title={`Make “${promote?.row.label}” a subcategory`} description={promote ? `${listingsNoun(promote.row)} move there and the owners are told.` : undefined} size="sm"
        footer={<><Btn variant="ghost" onClick={() => setPromote(null)}>Cancel</Btn><Btn variant="primary" disabled={!promote || !promote.name.trim() || !promote.parentId || busy} onClick={confirmPromote}>{busy ? "Moving…" : `Create and move ${promote ? totalOf(promote.row) : ""}`}</Btn></>}>
        {promote ? (
          <div className={stack({ gap: 4 })}>
            <Field label="Subcategory name"><Input autoFocus value={promote.name} onChange={(e) => setPromote({ ...promote, name: e.target.value })} /></Field>
            <Field label="Under" hint={promote.row.group?.is_catch_all ? "“Something else” never gets subcategories. Pick the group this belongs to, or add one above first." : undefined}>
              <Select value={promote.parentId} onChange={(e) => setPromote({ ...promote, parentId: e.target.value })}>
                <option value="">Choose a group…</option>
                {realParents.map((p) => <option key={p.id} value={p.id}>{p.category_name}</option>)}
              </Select>
            </Field>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!file} onClose={() => setFile(null)} title={`File “${file?.row.label}” under…`} description={file ? `${listingsNoun(file.row)} move to the subcategory you pick and the owners are told.` : undefined} size="sm"
        footer={<><Btn variant="ghost" onClick={() => setFile(null)}>Cancel</Btn><Btn variant="primary" disabled={!file?.categoryId || busy} onClick={confirmFile}>{busy ? "Moving…" : `Move ${file ? totalOf(file.row) : ""}`}</Btn></>}>
        {file ? <Field label="Subcategory"><Select autoFocus value={file.categoryId} onChange={(e) => setFile({ ...file, categoryId: e.target.value })}>{shelfOptions}</Select></Field> : null}
      </Modal>
    </div>
  );
}
