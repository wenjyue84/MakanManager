import React, { useState } from "react";

interface DocumentItem {
  id: string;
  fileName: string;
  url: string;
}

interface StaffUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  roles: string;
  documents?: DocumentItem[];
}

interface Props {
  user: StaffUser;
}

export function EditProfileForm({ user }: Props) {
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email || "",
    address: user.address || "",
  });
  const [docs, setDocs] = useState<DocumentItem[]>(user.documents || []);

  const canEditAll = user.roles.split(",").some(r => ["owner", "manager"].includes(r));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/staff/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-role": user.roles },
      body: JSON.stringify(form),
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const doc = await fetch(`/api/staff/${user.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": user.id, "x-role": user.roles },
      body: JSON.stringify({ fileName: file.name, url: `/uploads/${file.name}` }),
    }).then(r => r.json());
    setDocs(prev => [...prev, doc]);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/staff/${user.id}/documents/${id}`, {
      method: "DELETE",
      headers: { "x-user-id": user.id, "x-role": user.roles },
    });
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 p-2 border rounded w-full"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          className="mt-1 p-2 border rounded w-full"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          className="mt-1 p-2 border rounded w-full"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input
          className="mt-1 p-2 border rounded w-full"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Documents</label>
        <input type="file" onChange={handleUpload} className="mt-1" />
        <ul className="mt-2 space-y-1">
          {docs.map(d => (
            <li key={d.id} className="flex justify-between items-center">
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{d.fileName}</a>
              {canEditAll && (
                <button type="button" onClick={() => handleDelete(d.id)} className="text-red-500">Delete</button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={!canEditAll}>Save</button>
    </form>
  );
}
