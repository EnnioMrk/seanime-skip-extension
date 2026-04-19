/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./core.d.ts" />

const DEFAULT_SKIP_SECONDS = 85
const MIN_SKIP_SECONDS = 1
const MAX_SKIP_SECONDS = 3600

const TIMESTAMP_SELECTOR = '[data-vc-element="timestamp"]'
const BUTTON_SELECTOR = '[data-seanime-skip-ahead-button="true"]'

function getConfiguredSkipSeconds() {
    const rawValue = $getUserPreference("skipSeconds")
    const parsed = parseInt(rawValue || "", 10)

    if (isNaN(parsed)) return DEFAULT_SKIP_SECONDS
    if (parsed < MIN_SKIP_SECONDS) return MIN_SKIP_SECONDS
    if (parsed > MAX_SKIP_SECONDS) return MAX_SKIP_SECONDS

    return parsed
}

function init() {
    $ui.register((ctx) => {
        const skipSeconds = getConfiguredSkipSeconds()
        const buttonText = "+" + skipSeconds + "s"

        let stopObserving = null

        async function ensureSkipButton(timestampElement) {
            const parent = await timestampElement.getParent()
            if (!parent) return

            const existingButton = await parent.queryOne(BUTTON_SELECTOR)
            if (existingButton) {
                existingButton.setText(buttonText)
                return
            }

            const button = await ctx.dom.createElement("button")
            button.setAttribute("type", "button")
            button.setAttribute("data-seanime-skip-ahead-button", "true")
            button.setText(buttonText)

            button.setStyle("margin-left", "0.5rem")
            button.setStyle("padding", "0.1rem 0.45rem")
            button.setStyle("height", "1.5rem")
            button.setStyle("border-radius", "0.375rem")
            button.setStyle("border", "1px solid rgba(255, 255, 255, 0.25)")
            button.setStyle("background", "rgba(255, 255, 255, 0.12)")
            button.setStyle("color", "#ffffff")
            button.setStyle("font-size", "0.8rem")
            button.setStyle("line-height", "1")
            button.setStyle("cursor", "pointer")

            button.addEventListener("mouseenter", () => {
                button.setStyle("background", "rgba(255, 255, 255, 0.2)")
            })

            button.addEventListener("mouseleave", () => {
                button.setStyle("background", "rgba(255, 255, 255, 0.12)")
            })

            button.addEventListener("click", () => {
                try {
                    const playbackStatus = ctx.videoCore.getPlaybackStatus()
                    if (!playbackStatus || playbackStatus.duration <= 1) return

                    ctx.videoCore.seek(skipSeconds)
                    ctx.videoCore.showMessage("Skipped +" + skipSeconds + "s", 1200)
                } catch (error) {
                    ctx.toast.warning("Could not skip right now")
                }
            })

            timestampElement.after(button)
        }

        ctx.dom.onMainTabReady(() => {
            if (stopObserving) {
                stopObserving()
            }

            const result = ctx.dom.observe(TIMESTAMP_SELECTOR, async (timestamps) => {
                for (let i = 0; i < timestamps.length; i += 1) {
                    await ensureSkipButton(timestamps[i])
                }
            })

            stopObserving = result[0]
            const refetch = result[1]
            refetch()
        })
    })
}
