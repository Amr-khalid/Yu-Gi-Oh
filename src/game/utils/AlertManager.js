/**
 * AlertManager.js
 * Centralized Pharaonic Youth Alert & Notification Manager.
 * Intercepts window.alert and provides rich Egyptian Youth Colloquial messages.
 * 100% offline, zero emojis.
 */

import soundManager from '../audio/SoundManager.js';
import hapticManager from './HapticManager.js';

let alertCallback = null;

// Common engine phrases to authentic Egyptian youth expressions
const EGYPTIAN_YOUTH_MAPPINGS = [
  {
    test: /لقد نفذ هذا الوحش هجومه/i,
    replacement: 'الوحش ده ضرب خلاص في الدور ده يا بطل، ارتاح واستنى الدور الجاي!',
  },
  {
    test: /الوحش في وضع الدفاع لا يمكنه/i,
    replacement: 'الوحش ده متداري في وضع الدفاع يا صاحبي، ماينفعش يضرب وهو كده!',
  },
  {
    test: /لا يمكن استدعاء أو وضع بطاقات السحر أو الفخاخ في خانات الوحوش/i,
    replacement: 'حاسب يا غالي! دي ورقة سحر أو فخ، ماتنزلش في خانات الوحوش خالص.',
  },
  {
    test: /لا يمكن وضع بطاقات الوحوش في خانات السحر/i,
    replacement: 'حاسب يا صاحبي! كروت الوحوش بتنزل في خانات الوحوش بس مش في السحر.',
  },
  {
    test: /جميع مناطق الوحوش ممتلئة|خانات الوحوش في ساحتك ممتلئة/i,
    replacement: 'الساحة عندك مفولة بالوحوش يا كابتن! مافيش مكان فاضي ينزل فيه.',
  },
  {
    test: /جميع مناطق السحر والفخاخ ممتلئة/i,
    replacement: 'خانات السحر والفخاخ عندك مليانة على الآخر يا بطل!',
  },
  {
    test: /يجب مهاجمة وحوش الخصم الموجودة في الساحة أولاً/i,
    replacement: 'حاسب يا بطل! لازم تخلص على وحوش الخصم اللي قدامك في الساحة الأول قبل أي حاجة!',
  },
  {
    test: /لا يمكن الهجوم المباشر طالما توجد وحوش/i,
    replacement: 'ماينفعش تضرب مباشر يا صاحبي طول ما الخصم واقف له وحوش تحميه، خلّص على وحوشه الأول!',
  },
  {
    test: /لا توجد وحوش في مقبرة أي من المبارزين/i,
    replacement: 'المقابر فاضية يا صاحبي ومافيهاش ولا وحش تقدر تصحيه دلوقتي!',
  },
  {
    test: /نقاط حياتك غير كافية لدفع تكلفة الدفن المبكر/i,
    replacement: 'دمك مش مكفّي يا غالي تدفع 800 نقطة حياة للدفن المبكر!',
  },
  {
    test: /لا توجد وحوش في مقبرتك/i,
    replacement: 'مقبرتك فاضية يا بطل ومافيهاش وحوش تقدر ترجعها.',
  },
  {
    test: /لا توجد بطاقات سحر في مقبرتك/i,
    replacement: 'مافيش كروت سحر في مقبرتك علشان ترجعها لإيدك يا كابتن.',
  },
  {
    test: /مش دورك تلعب دلوقتي/i,
    replacement: 'مش دورك تلعب دلوقتي يا بطل، استنى دورك وروّق!',
  },
  {
    test: /ماتقدرش تهجم في أول دور/i,
    replacement: 'ماتقدرش تهجم في أول دور في الماتش يا صاحبي، جهّز صفوفك الأول!',
  },
  {
    test: /الهجوم في مرحلة المعركة بس/i,
    replacement: 'الهجوم بيتعمل في مرحلة المعركة بس يا بطل، ادخل مرحلة الهجوم الأول!',
  },
  {
    test: /المجموعة يجب أن تكون 60 كارت/i,
    replacement: 'المجموعة ماتزيدش عن 60 كارت يا بطل عشان تلعب بتركيز!',
  },
  {
    test: /لا يمكن وضع أكثر من 3 نسخ/i,
    replacement: 'ماينفعش تحط أكتر من 3 نسخ من نفس الكارت يا صاحبي، ده القانون الرسمي!',
  },
  {
    test: /رمز الغرفة يجب أن يتكون من 4 أرقام|رمز الغرفة غير صحيح أو أن المستضيف غير متصل|كود الروم مش مظبوط/i,
    replacement: 'كود الروم مش مظبوط أو صاحب الروم قفل أو مش متصل دلوقتي، اتأكد من الكود يا وحش وجرب تاني!',
  },
  {
    test: /انقطع الاتصال مع المنافس/i,
    replacement: 'الاتصال مع المنافس اتقطع يا غالي، ارجع وجرب تدخل تاني!',
  },
  {
    test: /حدثت مشكلة غير متوقعة/i,
    replacement: 'حصل هنج مفاجئ يا غالي، ما تقلقش ارجع لشاشة البداية وكمل لعبك عادي!',
  },
  {
    test: /رباط الجاذبية/i,
    replacement: 'رباط الجاذبية مانع أي وحش ليفل 4 أو أعلى إنه يضرب يا كابتن!',
  },
  {
    test: /جينزو|Jinzo/i,
    replacement: 'جينزو في الملعب ومعطل كل الفخاخ، مافيش فخ هيشتغل يا بطل!',
  },
  {
    test: /ماتقدرش تغير وضع الوحش/i,
    replacement: 'ماتقدرش تغير وضع الوحش إلا في المرحلة الأولى أو التانية يا صاحبي!',
  },
  {
    test: /الوحش ده نزّلته أو غيرت وضعه خلاص/i,
    replacement: 'الوحش ده نزلته أو غيرت وضعه خلاص في الدور ده، استنى الدور الجاي يا وحش!',
  },
  {
    test: /ماتقدرش تشغل كارت الفخ في نفس الدور/i,
    replacement: 'الفخ محتاج يستوي دور الأول! ماتقدرش تشغله في نفس الدور اللي حطيته فيه يا غالي.',
  },
  {
    test: /الوحش ده متكتف/i,
    replacement: 'الوحش ده متكتف ومحبوس، مايقدرش يضرب دلوقتي يا بطل!',
  },
];

export function toEgyptianYouth(text) {
  if (!text || typeof text !== 'string') return 'حصلت حركة مش مضبوطة يا بطل!';

  // Purge any royal keywords ('الملكية' / 'الملكي')
  let cleaned = text
    .replace(/الملكية/g, 'الأسطورية')
    .replace(/الملكي/g, 'الأسطوري')
    .replace(/ملكية/g, 'أسطورية')
    .replace(/ملكي/g, 'أسطوري');

  for (const item of EGYPTIAN_YOUTH_MAPPINGS) {
    if (item.test.test(cleaned)) {
      return item.replacement;
    }
  }

  // If text already sounds Egyptian youth or has no mapping, return cleaned
  return cleaned;
}

export function subscribeAlert(callback) {
  alertCallback = callback;
  return () => {
    if (alertCallback === callback) {
      alertCallback = null;
    }
  };
}

export function showPharaohAlert(message, options = {}) {
  const finalMessage = toEgyptianYouth(message);
  const title = options.title || 'حاسب يا بطل';
  const actionLabel = options.actionLabel || 'تمام يا صاحبي';
  const type = options.type || 'warning'; // 'warning' | 'info' | 'error'

  soundManager.playDecide();
  hapticManager.triggerCombatVibration('click');

  if (alertCallback) {
    alertCallback({
      isOpen: true,
      title,
      message: finalMessage,
      actionLabel,
      type,
    });
  } else {
    // If not subscribed yet, log safely without blocking
    console.warn('[Pharaoh Alert]:', finalMessage);
  }
}

/**
 * Global interceptor that hooks into window.alert
 */
export function installPharaohAlert() {
  if (typeof window !== 'undefined') {
    window.alert = (msg) => {
      showPharaohAlert(String(msg));
    };
  }
}

export default {
  showPharaohAlert,
  subscribeAlert,
  installPharaohAlert,
  toEgyptianYouth,
};
