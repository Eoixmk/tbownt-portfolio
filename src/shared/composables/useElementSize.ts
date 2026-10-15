import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Tracks the border-box size of an element with a ResizeObserver.
 * The observer reports once right after `observe()`, before the first paint,
 * so callers get their initial size without forcing a layout read.
 */
export function useElementSize(target: Ref<HTMLElement | null>) {
  const width = ref(0)
  const height = ref(0)
  let observer: ResizeObserver | undefined

  onMounted(() => {
    if (!target.value) return
    observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const box = entry.borderBoxSize?.[0]
      width.value = box ? box.inlineSize : entry.contentRect.width
      height.value = box ? box.blockSize : entry.contentRect.height
    })
    observer.observe(target.value)
  })
  onBeforeUnmount(() => observer?.disconnect())

  return { width, height }
}
