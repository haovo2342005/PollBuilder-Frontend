<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPoll } from '../api/polls'
import { ApiError } from '../api/http'
import PollCodeBadge from '../components/PollCodeBadge.vue'

const router = useRouter()

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const question = ref('')
const options = ref(['', ''])
const submitting = ref(false)
const errorMessage = ref(null)
const createdPoll = ref(null)

const canAddOption = computed(() => options.value.length < MAX_OPTIONS)
const canRemoveOption = computed(() => options.value.length > MIN_OPTIONS)

function addOption() {
  if (canAddOption.value) options.value.push('')
}

function removeOption(index) {
  if (canRemoveOption.value) options.value.splice(index, 1)
}

function voteLink(code) {
  return `${window.location.origin}/poll/${code}`
}

async function handleSubmit() {
  errorMessage.value = null

  const trimmedQuestion = question.value.trim()
  const trimmedOptions = options.value.map((o) => o.trim())

  if (!trimmedQuestion) {
    errorMessage.value = 'Nhập câu hỏi cho poll.'
    return
  }
  if (trimmedOptions.some((o) => !o)) {
    errorMessage.value = 'Mỗi lựa chọn phải có nội dung, không được để trống.'
    return
  }

  submitting.value = true
  try {
    createdPoll.value = await createPoll({
      question: trimmedQuestion,
      options: trimmedOptions
    })
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      return
    }
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Không thể tạo poll. Thử lại sau.'
  } finally {
    submitting.value = false
  }
}

function copyLink() {
  navigator.clipboard?.writeText(voteLink(createdPoll.value.code))
}

function resetForm() {
  createdPoll.value = null
  question.value = ''
  options.value = ['', '']
}
</script>

<template>
  <section class="wrap">
    <template v-if="!createdPoll">
      <h1 class="title">Tạo poll mới</h1>
      <p class="subtitle">Đặt câu hỏi, thêm tối đa 6 lựa chọn, chia sẻ link — kết quả cập nhật trực tiếp.</p>

      <form class="card" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

        <div class="field">
          <label for="question">Câu hỏi</label>
          <input
            id="question"
            v-model="question"
            type="text"
            placeholder="Ngôn ngữ lập trình bạn thích nhất?"
            maxlength="200"
          />
        </div>

        <div class="field">
          <label>Lựa chọn ({{ options.length }}/{{ MAX_OPTIONS }})</label>
          <div class="option-row" v-for="(opt, i) in options" :key="i">
            <input
              v-model="options[i]"
              type="text"
              :placeholder="`Lựa chọn ${i + 1}`"
              maxlength="100"
            />
            <button
              type="button"
              class="remove-btn"
              :disabled="!canRemoveOption"
              title="Xóa lựa chọn"
              @click="removeOption(i)"
            >
              ✕
            </button>
          </div>
          <button type="button" class="btn btn-ghost add-btn" :disabled="!canAddOption" @click="addOption">
            + Thêm lựa chọn
          </button>
        </div>

        <button class="btn submit-btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Đang tạo...' : 'Tạo poll' }}
        </button>
      </form>
    </template>

    <template v-else>
      <h1 class="title">Poll đã sẵn sàng</h1>
      <p class="subtitle">Chia sẻ link bên dưới để mọi người bỏ phiếu.</p>

      <div class="card success-card">
        <PollCodeBadge :code="createdPoll.code" />

        <div class="field link-field">
          <label>Link bỏ phiếu</label>
          <div class="link-row">
            <input type="text" readonly :value="voteLink(createdPoll.code)" />
            <button class="btn btn-ghost" type="button" @click="copyLink">Sao chép</button>
          </div>
        </div>

        <div class="actions">
          <router-link class="btn" :to="{ name: 'results', params: { code: createdPoll.code } }">
            Xem kết quả trực tiếp
          </router-link>
          <router-link class="btn btn-ghost" :to="{ name: 'vote', params: { code: createdPoll.code } }">
            Mở trang bỏ phiếu
          </router-link>
        </div>

        <button class="btn btn-ghost new-poll-btn" type="button" @click="resetForm">
          Tạo poll khác
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.wrap {
  width: 100%;
  max-width: 560px;
}

.title {
  font-size: clamp(1.6rem, 4vw, 2.1rem);
}

.subtitle {
  margin: 0.5rem 0 1.6rem;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-row input {
  flex: 1;
  font-size: 1rem;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--line);
  border-radius: 4px;
  background: #fff;
}

.option-row input:focus {
  border-color: var(--ink);
}

.remove-btn {
  border: 1.5px solid var(--line);
  background: transparent;
  border-radius: 4px;
  width: 2.4rem;
  cursor: pointer;
  color: var(--ink-soft);
}

.remove-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.add-btn {
  margin-top: 0.3rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.88rem;
}

.submit-btn {
  width: 100%;
  margin-top: 0.6rem;
}

.success-card {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  align-items: flex-start;
}

.link-field {
  width: 100%;
}

.link-row {
  display: flex;
  gap: 0.5rem;
}

.link-row input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--line);
  border-radius: 4px;
  background: var(--paper);
  color: var(--ink-soft);
}

.actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.new-poll-btn {
  padding: 0.4rem 0;
  border: none;
  font-size: 0.85rem;
  text-decoration: underline;
}
</style>
