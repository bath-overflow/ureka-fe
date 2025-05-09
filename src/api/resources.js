// src/api/resources.js

export async function fetchResources(projectId) {
    const res = await fetch(`/projects/${projectId}/resources`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return await res.json(); // [{ filename }]
}

export async function uploadResource(projectId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/projects/${projectId}/resources`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload resource');
}

export async function deleteResource(projectId, filename) {
    const res = await fetch(`/projects/${projectId}/resources/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete resource');
}