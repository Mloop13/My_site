import type { Lang } from "./context";

export type ArchiveDict = {
  hero: { paragraph: string };
  projectsSection: { intro: string };
  projects: Array<{ title: string; description: string }>;
  method: { paragraph: string };
  processSteps: string[];
  about: { heading: string[]; lead: string; paragraph: string };
};

const ru: ArchiveDict = {
  hero: {
    paragraph:
      "Проектирую и собираю сайты, автоматизации и AI-инструменты. Удерживаю постановку задачи, бизнес-логику и проверку результата.",
  },
  projectsSection: {
    intro: "Задачи, которые удалось перевести из неопределённости в работающий результат.",
  },
  projects: [
    {
      title: "Рейтинг-листы приёмной кампании",
      description:
        "Помощь Колледжу высоких технологий при БГТУ им. В. Г. Шухова: сборка рейтинг-листов из выгрузки примерно на 1200 заявлений, сохранение ручных правок и обработка нестандартных статусов.",
    },
    {
      title: "Онлайн-запись в медицинский центр",
      description:
        "Дипломное приложение: каталог специалистов и процедур, запись на приём, личный кабинет, история визитов и бизнес-логика.",
    },
    {
      title: "Сайт компании медицинского ПО",
      description:
        "Сайт-визитка с каталогом продуктов: материалы, постановка задачи, визуальная система и итерации с заказчиком.",
    },
    {
      title: "Личная агентная инфраструктура",
      description:
        "Сводки, Telegram-доставка, источники данных и база знаний — полигон для изучения AI-агентов на собственных процессах.",
    },
  ],
  method: {
    paragraph: "AI здесь — производственный инструмент. Я отвечаю за постановку задачи, логику, проверку и итоговый результат.",
  },
  processSteps: [
    "Перевожу размытый запрос в требования и сценарии.",
    "Собираю сайт, бота или автоматизацию с помощью AI.",
    "Проверяю логику, ограничения и краевые случаи.",
    "Показываю результат и провожу через итерации.",
  ],
  about: {
    heading: ["Путь,", "а не маска."],
    lead:
      "ITHAKA — личная система Сергея Тимошенко: проекты, эксперименты и путь от первых рабочих решений к осознанной инженерной практике.",
    paragraph:
      "Выпускник Колледжа высоких технологий по направлению «Информационные системы и программирование». Изучаю AI-агентов, автоматизацию и разработку через реальные задачи. Следующая серия кейсов — B2B-лидогенерация.",
  },
};

const en: ArchiveDict = {
  hero: {
    paragraph:
      "I design and build websites, automations, and AI tools. I hold the task framing, the business logic, and the verification of the result.",
  },
  projectsSection: {
    intro: "Tasks turned from uncertainty into a working result.",
  },
  projects: [
    {
      title: "Admission rating sheets",
      description:
        "Support for the College of High Technologies at BSTU named after V. G. Shukhov: building rating sheets from a ~1,200-application export, preserving manual edits, handling non-standard statuses.",
    },
    {
      title: "Online booking for a medical center",
      description:
        "Capstone app: a catalog of specialists and procedures, appointment booking, a personal account, visit history, and the business logic.",
    },
    {
      title: "Website for a medical software company",
      description:
        "A business-card site with a product catalog: materials, task framing, a visual system, and iterating with the client.",
    },
    {
      title: "Personal agent infrastructure",
      description:
        "Digests, Telegram delivery, data sources, and a knowledge base — a testbed for learning AI agents on my own workflows.",
    },
  ],
  method: {
    paragraph: "AI here is a production tool. I own the task framing, the logic, the verification, and the final result.",
  },
  processSteps: [
    "I turn a vague request into requirements and scenarios.",
    "I build a site, bot, or automation with AI.",
    "I check the logic, constraints, and edge cases.",
    "I show the result and carry it through iterations.",
  ],
  about: {
    heading: ["A path,", "not a mask."],
    lead:
      "ITHAKA is Sergey Timoshenko's personal system: projects, experiments, and a path from first working solutions to deliberate engineering practice.",
    paragraph:
      "A graduate of the College of High Technologies, Information Systems and Programming track. Learning AI agents, automation, and development through real tasks. Next up: a series of B2B lead-gen cases.",
  },
};

export const archiveDict: Record<Lang, ArchiveDict> = { ru, en };
