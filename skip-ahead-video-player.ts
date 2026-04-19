/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
    $ui.register((ctx) => {
        const DEFAULT_SKIP_SECONDS = 85
        const MIN_SKIP_SECONDS = 1
        const MAX_SKIP_SECONDS = 3600

        const TIMESTAMP_SELECTORS = [
            '[data-vc-element="timestamp"]',
            '[data-vc-timestamp-type]'
        ]
        const OBSERVE_SELECTORS = [
            '[data-vc-element="timestamp"]',
            '[data-vc-timestamp-type]',
            '[data-vc-element="control-bar-main-section"]',
            '[data-vc-element="control-bar"]'
        ]
        const BUTTON_SELECTOR = '[data-seanime-skip-ahead-button="true"]'

        function getConfiguredSkipSeconds() {
            const rawValue = $getUserPreference("skipSeconds")
            const parsed = parseInt(rawValue || "", 10)

            if (isNaN(parsed)) return DEFAULT_SKIP_SECONDS
            if (parsed < MIN_SKIP_SECONDS) return MIN_SKIP_SECONDS
            if (parsed > MAX_SKIP_SECONDS) return MAX_SKIP_SECONDS

            return parsed
        }

        let observerStops = []
        let cancelPolling = null

        function cleanupObservers() {
            for (let i = 0; i < observerStops.length; i += 1) {
                observerStops[i]()
            }
            observerStops = []
        }

        function getButtonText() {
            return "+" + getConfiguredSkipSeconds() + "s"
        }

        function dedupeById(elements) {
            const seen = {}
            const unique = []

            for (let i = 0; i < elements.length; i += 1) {
                const el = elements[i]
                if (!el || !el.id) continue
                if (seen[el.id]) continue
                seen[el.id] = true
                unique.push(el)
            }

            return unique
        }

        async function isLikelyVisible(element) {
            try {
                const display = await element.getComputedStyle("display")
                if (display === "none") return false

                const visibility = await element.getComputedStyle("visibility")
                if (visibility === "hidden") return false

                const opacity = await element.getComputedStyle("opacity")
                if (opacity === "0") return false

                return true
            } catch (error) {
                return true
            }
        }

        async function findTargetTimestamp() {
            let allTimestamps = []

            for (let i = 0; i < TIMESTAMP_SELECTORS.length; i += 1) {
                const timestamps = await ctx.dom.query(TIMESTAMP_SELECTORS[i])
                allTimestamps = allTimestamps.concat(timestamps)
            }

            const uniqueTimestamps = dedupeById(allTimestamps)
            if (uniqueTimestamps.length === 0) return null

            for (let i = 0; i < uniqueTimestamps.length; i += 1) {
                if (await isLikelyVisible(uniqueTimestamps[i])) {
                    return uniqueTimestamps[i]
                }
            }

            return uniqueTimestamps[0]
        }

        async function ensureSkipButton(timestampElement) {
            const buttonText = getButtonText()
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

            button.setStyle("display", "inline-flex")
            button.setStyle("align-items", "center")
            button.setStyle("justify-content", "center")
            button.setStyle("flex-shrink", "0")
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
                    const skipSeconds = getConfiguredSkipSeconds()
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

        async function attachButtons() {
            const targetTimestamp = await findTargetTimestamp()
            if (!targetTimestamp) return

            await ensureSkipButton(targetTimestamp)

            const allButtons = await ctx.dom.query(BUTTON_SELECTOR)
            const uniqueButtons = dedupeById(allButtons)

            let targetButton = null
            const targetParent = await targetTimestamp.getParent()
            if (targetParent) {
                targetButton = await targetParent.queryOne(BUTTON_SELECTOR)
            }

            for (let i = 0; i < uniqueButtons.length; i += 1) {
                if (!targetButton || uniqueButtons[i].id !== targetButton.id) {
                    uniqueButtons[i].remove()
                }
            }
        }

        function start() {
            cleanupObservers()

            for (let i = 0; i < OBSERVE_SELECTORS.length; i += 1) {
                const result = ctx.dom.observe(OBSERVE_SELECTORS[i], () => {
                    attachButtons()
                })
                observerStops.push(result[0])
                result[1]()
            }

            if (cancelPolling) {
                cancelPolling()
            }
            cancelPolling = ctx.setInterval(() => {
                attachButtons()
            }, 1500)

            attachButtons()
        }

        ctx.dom.onReady(() => {
            start()
        })

        ctx.dom.onMainTabReady(() => {
            start()
        })
    })
}
