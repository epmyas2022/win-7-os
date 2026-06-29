<template>
  <div class="profile-view">
    <!-- Sidebar -->
    <nav class="profile-nav">
      <div class="profile-avatar">
        <img :src="avatar" :alt="name" class="avatar-img" />
        <div class="avatar-name">{{ name }}</div>
        <div class="avatar-title">{{ title }}</div>
      </div>

      <ul class="nav-list">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          class="nav-item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="nav-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </li>
      </ul>
    </nav>

    <!-- Content -->
    <div class="profile-content has-scrollbar">
      <!-- About -->
      <section v-if="activeTab === 'about'">
        <h2 class="section-title">About Me</h2>
        <p class="profile-bio">{{ bio }}</p>

        <table class="info-table">
          <tbody>
            <tr v-for="item in info" :key="item.label">
              <th>{{ item.label }}:</th>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Projects -->
      <section v-if="activeTab === 'projects'">
        <h2 class="section-title">Projects</h2>
        <div class="card-list">
          <div v-for="p in projects" :key="p.name" class="card">
            <div class="card-header">{{ p.name }}</div>
            <div class="card-desc">{{ p.description }}</div>
            <div v-if="p.tags" class="card-tags">
              <span v-for="t in p.tags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section v-if="activeTab === 'experience'">
        <h2 class="section-title">Experience</h2>
        <div class="timeline">
          <div v-for="e in experience" :key="e.role + e.company" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-body">
              <div class="timeline-role">{{ e.role }}</div>
              <div class="timeline-company">{{ e.company }}</div>
              <div class="timeline-period">{{ e.period }}</div>
              <div v-if="e.description" class="timeline-desc">{{ e.description }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Fun facts -->
      <section v-if="activeTab === 'fun'">
        <h2 class="section-title">Interesting Facts</h2>
        <ul class="fun-list">
          <li v-for="fact in funFacts" :key="fact" class="fun-item">
            <span class="fun-bullet">★</span> {{ fact }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface ProfileProject {
  name: string
  description: string
  tags?: string[]
}

export interface ProfileExperience {
  role: string
  company: string
  period: string
  description?: string
}

 defineProps<{
  name: string
  title: string
  avatar: string
  bio: string
  info: { label: string; value: string }[]
  projects: ProfileProject[]
  experience: ProfileExperience[]
  funFacts: string[]
}>()

const tabs = [
  { id: 'about',      icon: '👤', label: 'About' },
  { id: 'projects',   icon: '📁', label: 'Projects' },
  { id: 'experience', icon: '💼', label: 'Experience' },
  { id: 'fun',        icon: '⭐', label: 'Fun Facts' },
]

const activeTab = ref('about')
</script>

<style scoped>
.profile-view {
  display: flex;
  height: 100%;
  font-family: 'Tahoma', 'Segoe UI', sans-serif;
  font-size: 12px;
  background: #fff;
}

/* ── Sidebar ── */
.profile-nav {
  width: 160px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, #dce9f7 0%, #b8d4ee 100%);
  border-right: 1px solid #9ab4d0;
  display: flex;
  flex-direction: column;
}

.profile-avatar {
  padding: 16px 12px 12px;
  text-align: center;
  border-bottom: 1px solid #9ab4d0;
  background: linear-gradient(to bottom, #2c6fad 0%, #1a4a80 100%);
}

.avatar-img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  object-fit: cover;
}

.avatar-name {
  color: #fff;
  font-weight: bold;
  font-size: 13px;
  margin-top: 6px;
}

.avatar-title {
  color: #c8dff5;
  font-size: 10px;
  margin-top: 2px;
}

.nav-list {
  list-style: none;
  margin: 6px 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  cursor: pointer;
  color: #1a3c6e;
  font-size: 12px;
  border-left: 3px solid transparent;
  transition: background 0.1s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.7);
  border-left-color: #2c6fad;
  font-weight: bold;
}

.nav-icon {
  font-size: 14px;
}

/* ── Content ── */
.profile-content {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #1a3c6e;
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #c2d8f0;
}

/* About */
.profile-bio {
  margin: 0 0 14px;
  line-height: 1.6;
  color: #333;
}

.info-table {
  border-collapse: collapse;
  width: 100%;
}

.info-table th {
  text-align: right;
  padding: 3px 12px 3px 0;
  color: #555;
  font-weight: normal;
  white-space: nowrap;
  width: 120px;
  vertical-align: top;
}

.info-table td {
  padding: 3px 0;
  color: #000;
}

/* Projects */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card {
  border: 1px solid #c2d8f0;
  border-radius: 4px;
  padding: 10px 12px;
  background: linear-gradient(to bottom, #f5f9fe 0%, #eaf3fc 100%);
}

.card-header {
  font-weight: bold;
  color: #1a3c6e;
  margin-bottom: 4px;
}

.card-desc {
  color: #444;
  line-height: 1.5;
}

.card-tags {
  margin-top: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 1px 6px;
  background: #d4e6f7;
  border: 1px solid #9ab4d0;
  border-radius: 3px;
  font-size: 10px;
  color: #1a3c6e;
}

/* Experience */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 18px;
  bottom: 0;
  width: 1px;
  background: #c2d8f0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #5ba3e0 0%, #2c6fad 100%);
  border: 2px solid #9ab4d0;
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-role {
  font-weight: bold;
  color: #1a3c6e;
}

.timeline-company {
  color: #2c6fad;
  margin-top: 1px;
}

.timeline-period {
  font-size: 11px;
  color: #888;
  margin-top: 1px;
}

.timeline-desc {
  margin-top: 4px;
  color: #444;
  line-height: 1.5;
}

/* Fun facts */
.fun-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fun-item {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #f5f9fe 0%, #eaf3fc 100%);
  border: 1px solid #c2d8f0;
  border-radius: 4px;
  color: #333;
  line-height: 1.5;
}

.fun-bullet {
  color: #f0a500;
  flex-shrink: 0;
}
</style>
