import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  Sliders,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  BookOpen,
  Search,
  ShieldCheck,
  Terminal,
  Bot,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  Clock,
  CheckCircle,
  GraduationCap,
  Layers,
  ArrowRight,
  Send,
  Share2,
  Star,
  PlayCircle,
  FileText,
  HelpCircle,
  Flame,
  Zap,
  Target,
  Atom,
  BookMarked,
  LayoutGrid,
  Code,
  BarChart3,
  Microscope,
  Compass,
  Award,
  BookOpenCheck,
  Building2,
  Plus,
  X,
  UserCheck,
  Filter,
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { getCrossSubdomainUrl } from '../../../utils/subdomain';

// --- DATA STRUCTURES ---

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'theory' | 'interactive' | 'lab';
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: 'ia-prompts' | 'arquitetura' | 'pesquisa' | 'metodologias' | 'computacao' | 'dados';
  categoryLabel: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  duration: string;
  lessonsCount: number;
  rating: number;
  reviewCount: number;
  color: string;
  bgBadge: string;
  icon: React.ElementType;
  tags: string[];
  modules: CourseModule[];
  // Campus specifics
  campusSlug?: string;
  campusName?: string;
  isCampusCourse?: boolean;
  authorName?: string;
}

export const INITIAL_COURSES: Course[] = [
  {
    id: 'gemini-mastery',
    title: 'Google Gemini 2.0: Do Básico à Maestria Acadêmica',
    subtitle: 'O guia definitivo para transformar modelos de linguagem em tutores de alta retenção nos seus estudos universitários.',
    category: 'ia-prompts',
    categoryLabel: 'IA & Prompts',
    level: 'Iniciante',
    duration: '4h 30m',
    lessonsCount: 14,
    rating: 4.9,
    reviewCount: 428,
    color: '#4285F4',
    bgBadge: 'bg-[#E8F0FE] text-[#1D4ED8] border-[#4285F4]',
    icon: GraduationCap,
    tags: ['Google Gemini', 'Engenharia de Prompt', 'Estudos Ativos'],
    isCampusCourse: false,
    modules: [
      {
        id: 'mod-1',
        title: 'Módulo 1: Como Modelos LLM e Transformers Funcionam',
        lessons: [
          { id: 'l-1-1', title: '1.1 A revolução da predição probabilística de tokens', duration: '12:00', type: 'theory' },
          { id: 'l-1-2', title: '1.2 Laboratório: Visualizador interativo de Tokenização', duration: '08:30', type: 'interactive' },
          { id: 'l-1-3', title: '1.3 Embeddings e espaço vetorial multidimensional', duration: '14:15', type: 'theory' },
          { id: 'l-1-4', title: '1.4 O mecanismo de Self-Attention e Temperatura', duration: '10:45', type: 'interactive' },
        ]
      },
      {
        id: 'mod-2',
        title: 'Módulo 2: Engenharia de Prompts de Alta Performance',
        lessons: [
          { id: 'l-2-1', title: '2.1 Anatomia do Prompt Ouro vs Comandos Fracos', duration: '15:00', type: 'theory' },
          { id: 'l-2-2', title: '2.2 Comparador Antes vs Depois por Disciplina', duration: '12:30', type: 'interactive' },
          { id: 'l-2-3', title: '2.3 Frameworks RTFC, Chain-of-Thought e Socrático', duration: '16:20', type: 'theory' },
        ]
      },
      {
        id: 'mod-3',
        title: 'Módulo 3: Protocolo Anti-Alucinação & Fact-Checking',
        lessons: [
          { id: 'l-3-1', title: '3.1 Por que os modelos alucinam e como blindar consultas', duration: '11:00', type: 'theory' },
          { id: 'l-3-2', title: '3.2 Grounding por Contexto e Citação de Fontes Reais', duration: '14:00', type: 'interactive' },
          { id: 'l-3-3', title: '3.3 Checklist de Confiabilidade para Artigos e TCCs', duration: '09:15', type: 'theory' },
        ]
      }
    ]
  },
  {
    id: 'llm-architecture',
    title: 'Arquitetura de LLMs: Transformers, Embeddings & Auto-Atenção',
    subtitle: 'Compreenda a matemática, as matrizes de atenção e os papers do Google que revolucionaram o mundo.',
    category: 'arquitetura',
    categoryLabel: 'Arquitetura & IA',
    level: 'Avançado',
    duration: '3h 15m',
    lessonsCount: 8,
    rating: 4.95,
    reviewCount: 290,
    color: '#34A853',
    bgBadge: 'bg-[#E6F4EA] text-[#137333] border-[#34A853]',
    icon: Atom,
    tags: ['Transformers', 'Self-Attention', 'Redes Neurais'],
    isCampusCourse: false,
    modules: [
      {
        id: 'mod-arch-1',
        title: 'Módulo 1: O Paper Histórico do Google (2017)',
        lessons: [
          { id: 'l-arch-1-1', title: '1.1 Attention Is All You Need: O fim do gargalo das RNNs', duration: '18:00', type: 'theory' },
          { id: 'l-arch-1-2', title: '1.2 Multi-Head Attention e projeções Q, K, V', duration: '22:30', type: 'theory' },
        ]
      },
      {
        id: 'mod-arch-2',
        title: 'Módulo 2: Álgebra Linear de Embeddings e Espaço Vetorial',
        lessons: [
          { id: 'l-arch-2-1', title: '2.1 Vetores densos, Similaridade de Cosseno e Proximidade', duration: '20:00', type: 'interactive' },
          { id: 'l-arch-2-2', title: '2.2 Tokenização Byte-Pair Encoding (BPE)', duration: '15:00', type: 'interactive' },
        ]
      }
    ]
  },
  {
    id: 'anti-hallucination',
    title: 'Protocolo Científico Anti-Alucinação & Fact-Checking',
    subtitle: 'Metodologia rigorosa para blindar TCCs, teses e artigos acadêmicos contra fontes inventadas.',
    category: 'pesquisa',
    categoryLabel: 'Rigor Científico & TCC',
    level: 'Intermediário',
    duration: '2h 30m',
    lessonsCount: 7,
    rating: 4.88,
    reviewCount: 310,
    color: '#EA4335',
    bgBadge: 'bg-[#FCE8E6] text-[#EA4335] border-[#EA4335]',
    icon: ShieldCheck,
    tags: ['Metodologia Científica', 'ABNT', 'Grounding'],
    isCampusCourse: false,
    modules: [
      {
        id: 'mod-hallu-1',
        title: 'Módulo 1: A Origem da Alucinação em Modelos Probabilísticos',
        lessons: [
          { id: 'l-h-1-1', title: '1.1 Por que modelos inventam dados com convicção', duration: '15:00', type: 'theory' },
          { id: 'l-h-1-2', title: '1.2 A armadilha das referências bibliográficas falsas', duration: '12:00', type: 'theory' },
        ]
      },
      {
        id: 'mod-hallu-2',
        title: 'Módulo 2: O Protocolo de 3 Etapas de Blindagem',
        lessons: [
          { id: 'l-h-2-1', title: '2.1 Grounding por Contexto estrito com prompt restritivo', duration: '18:00', type: 'interactive' },
          { id: 'l-h-2-2', title: '2.2 Chain-of-Verification (CoVe) e auto-auditoria', duration: '14:00', type: 'interactive' },
        ]
      }
    ]
  },
  {
    id: 'active-learning',
    title: 'Metodologias Ativas & Flashcards Anki com IA',
    subtitle: 'Domine a Técnica Feynman, repetição espaçada (SRS) e mapas conceituais automatizados.',
    category: 'metodologias',
    categoryLabel: 'Aprendizagem & Retenção',
    level: 'Iniciante',
    duration: '2h 45m',
    lessonsCount: 8,
    rating: 4.92,
    reviewCount: 375,
    color: '#FBBC04',
    bgBadge: 'bg-[#FFF8E1] text-[#B45309] border-[#FBBC04]',
    icon: Zap,
    tags: ['Active Recall', 'Anki SRS', 'Técnica Feynman'],
    isCampusCourse: false,
    modules: [
      {
        id: 'mod-act-1',
        title: 'Módulo 1: Neurociência da Memorização de Longo Prazo',
        lessons: [
          { id: 'l-act-1-1', title: '1.1 A Curva do Esquecimento e Active Recall', duration: '14:00', type: 'theory' },
          { id: 'l-act-1-2', title: '1.2 O Método Feynman com IA Socrática', duration: '16:00', type: 'interactive' },
        ]
      }
    ]
  },
  // Campus-specific courses created by university ambassadors
  {
    id: 'usp-rag-workshop',
    title: 'Workshop USP: RAG & Busca Vetorial em Python',
    subtitle: 'Trilha desenvolvida por embaixadores da USP para construção de sistemas RAG com embeddings locais e LangChain.',
    category: 'computacao',
    categoryLabel: 'Programação & Tech',
    level: 'Avançado',
    duration: '3h 40m',
    lessonsCount: 10,
    rating: 4.98,
    reviewCount: 180,
    color: '#4285F4',
    bgBadge: 'bg-[#E8F0FE] text-[#1D4ED8] border-[#4285F4]',
    icon: Code,
    tags: ['RAG', 'Python', 'Vector DB', 'Campus USP'],
    campusSlug: 'usp',
    campusName: 'Universidade de São Paulo (USP)',
    isCampusCourse: true,
    authorName: 'Embaixadores GSA USP',
    modules: [
      {
        id: 'mod-usp-1',
        title: 'Módulo 1: Arquitetura RAG (Retrieval-Augmented Generation)',
        lessons: [
          { id: 'l-usp-1-1', title: '1.1 Chunking de documentos e geração de embeddings', duration: '20:00', type: 'theory' },
          { id: 'l-usp-1-2', title: '1.2 Hands-on: Consulta semântica com ChromaDB', duration: '25:00', type: 'interactive' },
        ]
      }
    ]
  },
  {
    id: 'unicamp-vision-ai',
    title: 'Trilha UNICAMP: Visão Computacional & Redes Convolucionais',
    subtitle: 'Curso prático com notebooks Google Colab, detecção de objetos e integração multimodal com Gemini Pro Vision.',
    category: 'dados',
    categoryLabel: 'Data Science & Visão',
    level: 'Intermediário',
    duration: '3h 10m',
    lessonsCount: 8,
    rating: 4.91,
    reviewCount: 142,
    color: '#34A853',
    bgBadge: 'bg-[#E6F4EA] text-[#137333] border-[#34A853]',
    icon: BarChart3,
    tags: ['Visão Computacional', 'Colab', 'PyTorch', 'Campus UNICAMP'],
    campusSlug: 'unicamp',
    campusName: 'Universidade Estadual de Campinas (UNICAMP)',
    isCampusCourse: true,
    authorName: 'Comunidade Estudantil UNICAMP',
    modules: [
      {
        id: 'mod-unicamp-1',
        title: 'Módulo 1: Fundamentos de Imagem Digital & Tensores',
        lessons: [
          { id: 'l-uni-1-1', title: '1.1 Pré-processamento e aumento de dados', duration: '18:00', type: 'theory' },
          { id: 'l-uni-1-2', title: '1.2 Laboratório Colab: Classificação de Imagens', duration: '22:00', type: 'lab' },
        ]
      }
    ]
  },
  {
    id: 'ufrj-data-science',
    title: 'Trilha UFRJ: Análise Estatística & Visualização Científica',
    subtitle: 'Da manipulação com Pandas à geração de gráficos publication-ready para congressos acadêmicos.',
    category: 'dados',
    categoryLabel: 'Estatística & Pesquisa',
    level: 'Iniciante',
    duration: '2h 50m',
    lessonsCount: 7,
    rating: 4.89,
    reviewCount: 115,
    color: '#FBBC04',
    bgBadge: 'bg-[#FFF8E1] text-[#B45309] border-[#FBBC04]',
    icon: Microscope,
    tags: ['Pandas', 'Seaborn', 'Estatística', 'Campus UFRJ'],
    campusSlug: 'ufrj',
    campusName: 'Universidade Federal do Rio de Janeiro (UFRJ)',
    isCampusCourse: true,
    authorName: 'Embaixadores GSA UFRJ',
    modules: [
      {
        id: 'mod-ufrj-1',
        title: 'Módulo 1: Estatística Descritiva & Limpeza de Datasets',
        lessons: [
          { id: 'l-ufrj-1-1', title: '1.1 Tratamento de valores nulos e correlação de Pearson', duration: '19:00', type: 'theory' },
        ]
      }
    ]
  }
];

const FLASHCARDS = [
  {
    topic: 'Arquitetura de LLMs',
    front: 'O que é a camada de Self-Attention na arquitetura Transformer?',
    back: 'É o mecanismo matemático criado pelo Google que calcula a correlação contextual de cada palavra com todas as outras palavras da frase simultaneamente, resolvendo ambiguidades semânticas.'
  },
  {
    topic: 'Hiperparâmetros',
    front: 'O que acontece quando aumentamos a Temperatura (Temperature) no Gemini?',
    back: 'Aumenta a entropia e a aleatoriedade na escolha do próximo token, tornando a resposta mais criativa e diversa, mas menos previsível para tarefas factuais.'
  },
  {
    topic: 'Engenharia de Prompt',
    front: 'Qual o princípio fundamental do Chain-of-Thought (Cadeia de Pensamento)?',
    back: 'Instruir a IA a decompor o raciocínio em etapas intermediárias antes de apresentar a conclusão final, reduzindo erros lógicos em mais de 60%.'
  },
  {
    topic: 'Confiabilidade Científica',
    front: 'O que é Grounding por Contexto e por que ele elimina alucinações?',
    back: 'É fornecer o texto de referência na janela de contexto e ordenar estritamente que o modelo responda apenas com base no material, declarando ausência de dados quando necessário.'
  }
];

const PROMPT_COMPARISONS = [
  {
    id: 'exatas',
    subject: 'Ciências Exatas & Cálculo',
    bad: 'Me dá a derivada de f(x) = x^3 * sin(x)',
    badNote: 'Gera a resposta pronta sem ensinar a regra do produto nem o raciocínio pedagógico.',
    gold: `Atue como um Professor Titular de Cálculo I com método socrático.
Objetivo: Me ensinar a derivar f(x) = x^3 * sin(x).
Diretrizes obrigatórias:
1. NÃO dê o resultado final de imediato.
2. Identifique qual regra deve ser utilizada e a intuição por trás dela.
3. Divida a resolução nas etapas dos blocos fundamentais (u, v, u', v').
4. Formule 1 pergunta reflexiva para testar minha compreensão antes de continuar.`,
    goldNote: 'Ativa persona docente, scaffolding passo a passo e impede o spoiler do gabarito.'
  },
  {
    id: 'humanas',
    subject: 'Ciências Humanas & Sociologia',
    bad: 'Resume o conceito de Fato Social de Durkheim para mim.',
    badNote: 'Gera uma definição enciclopédica genérica sem contraste teórico ou aplicação crítica.',
    gold: `Você é um orientador acadêmico em Ciências Sociais.
Contexto: Estou estudando para prova de Teoria Sociológica Clássica.
Tarefa: Crie uma síntese aprofundada do conceito de 'Fato Social' de Émile Durkheim.
Formato:
- Tabela comparativa das 3 características (Coerção, Exterioridade, Generalidade) com 1 exemplo brasileiro atual.
- Contraste em 1 parágrafo com a Ação Social de Max Weber.
- 2 questões dissertativas de nível universitário para treino.`,
    goldNote: 'Especifica formato em tabela, exige contextualização e promove pensamento crítico comparativo.'
  }
];

export const StudentAIGuidePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('gsa_custom_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_COURSES, ...parsed];
      }
    } catch {}
    return INITIAL_COURSES;
  });

  // View modes: 'catalog' | 'classroom' | 'lab'
  const [viewMode, setViewMode] = useState<'catalog' | 'classroom' | 'lab'>('catalog');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('gemini-mastery');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'campus'>('all');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Course Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseCampus, setNewCourseCampus] = useState('usp');
  const [newCourseCampusName, setNewCourseCampusName] = useState('Universidade de São Paulo (USP)');
  const [newCourseLevel, setNewCourseLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [newCourseCategory, setNewCourseCategory] = useState<'ia-prompts' | 'arquitetura' | 'pesquisa' | 'metodologias' | 'computacao' | 'dados'>('ia-prompts');
  const [newCourseDuration, setNewCourseDuration] = useState('2h 30m');
  const [newCourseTags, setNewCourseTags] = useState('IA, Workshop, Campus');
  const [newLessonTitle, setNewLessonTitle] = useState('1.1 Introdução prática ao tema');

  // Classroom State
  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0]!;
  }, [courses, selectedCourseId]);

  const [activeLessonId, setActiveLessonId] = useState<string>('l-1-1');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set(['l-1-1']));
  const [openModuleIds, setOpenModuleIds] = useState<Set<string>>(new Set(['mod-1', 'mod-2', 'mod-arch-1', 'mod-hallu-1', 'mod-act-1', 'mod-usp-1']));

  // Lab Widgets
  const [tokenInput, setTokenInput] = useState<string>('O Google Gemini utiliza transformers e embeddings para processar linguagem natural.');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [activeComparisonId, setActiveComparisonId] = useState<string>('exatas');
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check URL query parameters for direct tab navigation (e.g. ?tab=campuses)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'campuses') {
      setScopeFilter('campus');
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const targetCourse = courses.find(c => c.id === courseId);
    if (targetCourse?.modules[0]?.lessons[0]) {
      setActiveLessonId(targetCourse.modules[0].lessons[0].id);
    }
    setViewMode('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLessonCompleted = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newCourse: Course = {
      id: `campus-${Date.now()}`,
      title: newCourseTitle.trim(),
      subtitle: newCourseSubtitle.trim() || 'Curso criado pela comunidade acadêmica.',
      category: newCourseCategory,
      categoryLabel: newCourseCategory === 'ia-prompts' ? 'IA & Prompts'
        : newCourseCategory === 'arquitetura' ? 'Arquitetura & IA'
        : newCourseCategory === 'pesquisa' ? 'Rigor Científico'
        : newCourseCategory === 'computacao' ? 'Programação & Tech'
        : newCourseCategory === 'dados' ? 'Data Science'
        : 'Metodologias',
      level: newCourseLevel,
      duration: newCourseDuration.trim() || '2h 00m',
      lessonsCount: 4,
      rating: 5.0,
      reviewCount: 1,
      color: '#4285F4',
      bgBadge: 'bg-[#E8F0FE] text-[#1D4ED8] border-[#4285F4]',
      icon: GraduationCap,
      tags: newCourseTags.split(',').map(t => t.trim()).filter(Boolean),
      campusSlug: newCourseCampus,
      campusName: newCourseCampusName,
      isCampusCourse: true,
      authorName: 'Embaixador do Campus',
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Módulo 1: Fundamentos & Prática no Campus',
          lessons: [
            { id: `l-${Date.now()}-1`, title: newLessonTitle.trim() || '1.1 Introdução prática', duration: '15:00', type: 'theory' },
            { id: `l-${Date.now()}-2`, title: '1.2 Exercício Prático e Discussão', duration: '20:00', type: 'interactive' },
          ]
        }
      ]
    };

    const updated = [newCourse, ...courses];
    setCourses(updated);
    try {
      const customOnly = updated.filter(c => c.id.startsWith('campus-'));
      localStorage.setItem('gsa_custom_courses', JSON.stringify(customOnly));
    } catch {}

    setIsCreateModalOpen(false);
    setNewCourseTitle('');
    setNewCourseSubtitle('');
    setScopeFilter('campus');
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Scope Filter
      if (scopeFilter === 'global' && course.isCampusCourse) return false;
      if (scopeFilter === 'campus' && !course.isCampusCourse) return false;

      // Campus selector filter
      if (selectedCampusFilter !== 'all' && course.campusSlug !== selectedCampusFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && course.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(q);
        const matchesSub = course.subtitle.toLowerCase().includes(q);
        const matchesTag = course.tags.some(t => t.toLowerCase().includes(q));
        const matchesCampus = course.campusName?.toLowerCase().includes(q);
        return matchesTitle || matchesSub || matchesTag || matchesCampus;
      }

      return true;
    });
  }, [courses, scopeFilter, selectedCampusFilter, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFE] text-[#1e293b] font-sans selection:bg-[#FBBC04] flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Banner Header */}
      <section className="relative pt-28 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8 border-b-2 border-slate-200/80 bg-white/60 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-[#FBBC04] text-[#1e293b] font-black text-xs px-3.5 py-1.5 rounded-full border-2 border-[#1e293b] shadow-2xs -rotate-1">
                <Sparkles size={14} />
                <span>ACADEMIA DE IA &amp; CURSOS UNIVERSITÁRIOS 2026</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
                {viewMode === 'catalog' && 'Trilhas & Cursos de IA para Universitários'}
                {viewMode === 'classroom' && selectedCourse.title}
                {viewMode === 'lab' && 'Laboratório Interativo de Prompts & Tokens'}
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-3xl leading-relaxed">
                {viewMode === 'catalog' && 'Formações abertas da comunidade e cursos práticos criados por lideranças estudantis em cada campus universitário.'}
                {viewMode === 'classroom' && selectedCourse.subtitle}
                {viewMode === 'lab' && 'Experimente tokens, compare prompts fracos vs ouro e pratique flashcards 3D baseados na metodologia Feynman.'}
              </p>
            </div>

            {/* View Mode Switcher Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-[#1e293b] self-start md:self-auto shrink-0 shadow-2xs">
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'catalog'
                    ? 'bg-[#4285F4] text-white border border-[#1e293b] shadow-2xs'
                    : 'text-slate-700 hover:text-[#1e293b]'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Catálogo</span>
              </button>

              <button
                onClick={() => setViewMode('lab')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'lab'
                    ? 'bg-[#34A853] text-white border border-[#1e293b] shadow-2xs'
                    : 'text-slate-700 hover:text-[#1e293b]'
                }`}
              >
                <Brain size={14} />
                <span>Laboratório</span>
              </button>

              {viewMode === 'classroom' && (
                <button
                  onClick={() => setViewMode('classroom')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-[#FBBC04] text-[#1e293b] border border-[#1e293b] shadow-2xs flex items-center gap-1.5"
                >
                  <BookOpenCheck size={14} />
                  <span>Sala de Aula</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* --- VIEW 1: MINIMALIST COURSE CATALOG --- */}
      {/* ========================================================================= */}
      {viewMode === 'catalog' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10 animate-fadeIn">
          
          {/* Controls Bar: Scope, Campus filter, Search, Create Button */}
          <div className="p-4 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Scope Switcher (Todos vs Globais vs Campus) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border-2 border-slate-300">
                <button
                  onClick={() => setScopeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    scopeFilter === 'all'
                      ? 'bg-white text-[#1e293b] border-2 border-[#1e293b] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({courses.length})
                </button>

                <button
                  onClick={() => setScopeFilter('global')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    scopeFilter === 'global'
                      ? 'bg-[#4285F4] text-white border-2 border-[#1e293b] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cursos Globais GSA
                </button>

                <button
                  onClick={() => setScopeFilter('campus')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                    scopeFilter === 'campus'
                      ? 'bg-[#FBBC04] text-[#1e293b] border-2 border-[#1e293b] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 size={13} />
                  <span>Por Campus</span>
                </button>
              </div>

              {/* Search & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar curso, tema ou campus..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] placeholder-slate-400 focus:outline-none focus:border-[#4285F4]"
                  />
                </div>

                {/* Create Campus Course Modal Button */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#34A853] hover:bg-[#2E954B] text-white text-xs font-black border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>Criar Curso do Campus</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              {[
                { id: 'all', label: 'Todas as Áreas' },
                { id: 'ia-prompts', label: 'Engenharia de Prompt' },
                { id: 'arquitetura', label: 'Arquitetura de LLMs' },
                { id: 'pesquisa', label: 'Rigor Científico & TCC' },
                { id: 'computacao', label: 'Programação & Software' },
                { id: 'dados', label: 'Data Science' },
                { id: 'metodologias', label: 'Aprendizagem & Anki' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-2xs font-black transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#1e293b] text-white border border-[#1e293b]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const Icon = course.icon;

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black hover:shadow-hard-hover transition-all flex flex-col justify-between p-6 overflow-hidden cursor-pointer"
                  onClick={() => handleOpenCourse(course.id)}
                >
                  <div className="space-y-4">
                    {/* Card Header with Badges */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-slate-100">
                      <span className={`text-2xs font-mono font-black uppercase px-2.5 py-0.5 rounded-lg border ${course.bgBadge}`}>
                        {course.categoryLabel}
                      </span>
                      <span className="text-2xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {course.level}
                      </span>
                    </div>

                    {/* Campus Specific Pill if Applicable */}
                    {course.isCampusCourse && course.campusName && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FFF8E1] border-2 border-[#FBBC04] text-[#B45309] text-2xs font-black shadow-2xs">
                        <Building2 size={12} />
                        <span className="truncate max-w-[240px]">{course.campusName}</span>
                      </div>
                    )}

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-black text-[#1e293b] group-hover:text-[#4285F4] transition-colors leading-snug mb-1.5">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#475569] font-medium leading-relaxed line-clamp-3">
                        {course.subtitle}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-2xs font-mono font-bold bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between text-2xs text-[#64748b]">
                    <div className="flex items-center gap-3 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#4285F4]" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={13} className="text-[#34A853]" /> {course.lessonsCount} lições
                      </span>
                    </div>

                    <button
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-black border-2 border-[#1e293b] shadow-[2px_2px_0px_#1e293b] group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Acessar</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="p-16 rounded-3xl bg-white border-3 border-[#1e293b] text-center space-y-3 shadow-hard-black">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-black text-[#1e293b]">Nenhum curso encontrado</h3>
              <p className="text-xs text-[#64748b] font-medium max-w-sm mx-auto">
                Tente alterar os termos de busca ou filtros de universidade e categoria.
              </p>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* --- VIEW 2: INTERACTIVE CLASSROOM --- */}
      {/* ========================================================================= */}
      {viewMode === 'classroom' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('catalog')}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#4285F4] hover:underline cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Voltar ao Catálogo de Cursos</span>
            </button>

            <span className="text-2xs font-mono font-bold text-slate-500">
              Progresso: {completedLessonIds.size} de {selectedCourse.lessonsCount} lições concluídas
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Syllabus Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-5 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#1e293b] flex items-center gap-1.5">
                    <BookOpen size={15} className="text-[#4285F4]" />
                    Ementa &amp; Módulos
                  </h3>
                  <span className="text-2xs font-mono font-black bg-[#E8F0FE] text-[#1D4ED8] px-2 py-0.5 rounded-lg border border-[#4285F4]">
                    {selectedCourse.level}
                  </span>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {selectedCourse.modules.map(mod => (
                    <div key={mod.id} className="space-y-1.5">
                      <div className="text-xs font-black text-[#1e293b] px-2 py-1 bg-slate-50 rounded-xl border border-slate-200">
                        {mod.title}
                      </div>

                      <div className="space-y-1 pl-2">
                        {mod.lessons.map(lesson => {
                          const isActive = activeLessonId === lesson.id;
                          const isDone = completedLessonIds.has(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => setActiveLessonId(lesson.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveLessonId(lesson.id); }}
                              className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                                isActive
                                  ? 'bg-[#E8F0FE] text-[#1D4ED8] border-2 border-[#4285F4] shadow-2xs'
                                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLessonCompleted(lesson.id);
                                  }}
                                  className="shrink-0 cursor-pointer"
                                  aria-label="Marcar como concluída"
                                >
                                  {isDone ? (
                                    <CheckCircle2 size={15} className="text-[#34A853] fill-[#E6F4EA]" />
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 block" />
                                  )}
                                </button>
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              <span className="text-2xs font-mono text-slate-400 shrink-0">{lesson.duration}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Active Lesson Classroom Workspace */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-6">
                
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100">
                  <div className="space-y-1">
                    <span className="text-2xs font-mono font-black uppercase text-[#4285F4] tracking-wider">
                      Lição Ativa
                    </span>
                    <h2 className="text-xl font-black text-[#1e293b]">
                      Como estruturar Prompts Acadêmicos com o Google Gemini
                    </h2>
                  </div>

                  <button
                    onClick={() => toggleLessonCompleted(activeLessonId)}
                    className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      completedLessonIds.has(activeLessonId)
                        ? 'bg-[#E6F4EA] text-[#137333] border-[#34A853] shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-[#1e293b] border-[#1e293b] shadow-hard-black'
                    }`}
                  >
                    <CheckCircle2 size={14} className={completedLessonIds.has(activeLessonId) ? 'text-[#34A853]' : 'text-slate-400'} />
                    <span>{completedLessonIds.has(activeLessonId) ? 'Concluída ✓' : 'Marcar como Concluída'}</span>
                  </button>
                </div>

                {/* Lesson Content Body */}
                <div className="space-y-4 text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
                  <p>
                    Ao utilizar LLMs para estudos universitários, a chave para evitar alucinações e obter respostas de alto rigor científico é a aplicação do framework <strong>RTFC (Role, Task, Format, Constraint)</strong>.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#EEF5FF] border-2 border-[#4285F4] text-[#1e293b] space-y-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-[#1D4ED8] flex items-center gap-1.5">
                      <Lightbulb size={15} />
                      Estrutura Ouro de Prompt Acadêmico:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-xs">
                      <li><strong>Papel (Role):</strong> Atue como um Professor Doutor em Ciência da Computação.</li>
                      <li><strong>Tarefa (Task):</strong> Explique o funcionamento do algoritmo Dijkstra com método socrático.</li>
                      <li><strong>Formato (Format):</strong> Tabela com etapas passo a passo e complexidade temporal Big-O.</li>
                      <li><strong>Restrição (Constraint):</strong> Não dê a resposta final sem antes fazer 1 pergunta reflexiva.</li>
                    </ul>
                  </div>

                  <p>
                    Experimente o comparador interativo abaixo para verificar a diferença prática entre comandos genéricos e prompts estruturados.
                  </p>
                </div>

                {/* Interactive Prompt Comparator Widget */}
                <div className="pt-4 border-t-2 border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-[#1e293b]">
                      Comparador Interativo de Prompts
                    </h4>
                    <div className="flex gap-1.5">
                      {PROMPT_COMPARISONS.map(comp => (
                        <button
                          key={comp.id}
                          onClick={() => setActiveComparisonId(comp.id)}
                          className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-all cursor-pointer ${
                            activeComparisonId === comp.id
                              ? 'bg-[#4285F4] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {comp.subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  {PROMPT_COMPARISONS.filter(c => c.id === activeComparisonId).map(c => (
                    <div key={c.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-4 rounded-2xl bg-[#FCE8E6] border-2 border-[#EA4335] space-y-2">
                        <div className="flex items-center justify-between text-2xs font-black text-[#EA4335]">
                          <span>❌ PROMPT FRACO / VAGO</span>
                        </div>
                        <code className="text-xs font-mono text-slate-800 block bg-white/80 p-2.5 rounded-xl border border-[#EA4335]/30">
                          {c.bad}
                        </code>
                        <p className="text-2xs text-slate-600 font-bold">{c.badNote}</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] space-y-2">
                        <div className="flex items-center justify-between text-2xs font-black text-[#137333]">
                          <span>✓ PROMPT OURO CALIBRADO</span>
                          <button
                            onClick={() => copyToClipboard(c.gold, c.id)}
                            className="inline-flex items-center gap-1 text-2xs font-bold text-[#137333] hover:underline cursor-pointer"
                          >
                            {copiedKey === c.id ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedKey === c.id ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                        <pre className="text-2xs font-mono text-slate-800 whitespace-pre-wrap bg-white/80 p-2.5 rounded-xl border border-[#34A853]/30">
                          {c.gold}
                        </pre>
                        <p className="text-2xs text-slate-600 font-bold">{c.goldNote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* --- VIEW 3: INTERACTIVE LAB & SIMULATORS --- */}
      {/* ========================================================================= */}
      {viewMode === 'lab' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10 animate-fadeIn">
          
          {/* Lab 1: Interactive Tokenizer */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#4285F4] flex items-center justify-center font-black">
                  <Atom size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1e293b]">Simulador Visual de Tokenização</h3>
                  <p className="text-2xs text-[#64748b] font-medium">Veja como LLMs fragmentam textos em sub-palavras e IDs vetoriais.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-mono text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                placeholder="Digite uma frase para tokenizar..."
              />

              <div className="flex flex-wrap gap-1.5 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 min-h-[60px] items-center">
                {tokenInput.split(/(\s+|[.,!?;:])/).filter(Boolean).map((t, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 rounded-lg text-2xs font-mono font-black border ${
                      idx % 4 === 0 ? 'bg-[#E8F0FE] text-[#1D4ED8] border-[#4285F4]'
                      : idx % 4 === 1 ? 'bg-[#FCE8E6] text-[#EA4335] border-[#EA4335]'
                      : idx % 4 === 2 ? 'bg-[#FFF8E1] text-[#B45309] border-[#FBBC04]'
                      : 'bg-[#E6F4EA] text-[#137333] border-[#34A853]'
                    }`}
                  >
                    {t === ' ' ? '␣' : t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Lab 2: Interactive 3D Flashcards Anki */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-[#1e293b] shadow-hard-black space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] text-[#B45309] flex items-center justify-center font-black">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1e293b]">Flashcards Anki &amp; Active Recall</h3>
                  <p className="text-2xs text-[#64748b] font-medium">Repetição espaçada com cartões conceituais.</p>
                </div>
              </div>
              <span className="text-2xs font-mono font-bold text-slate-500">
                Cartão {flashcardIndex + 1} de {FLASHCARDS.length}
              </span>
            </div>

            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-8 rounded-3xl bg-[#FAFAFE] border-3 border-[#1e293b] shadow-[4px_4px_0px_#1e293b] min-h-[160px] flex flex-col justify-between cursor-pointer hover:bg-white transition-all text-center select-none"
            >
              <span className="text-2xs font-mono font-black uppercase text-[#4285F4]">
                {FLASHCARDS[flashcardIndex]!.topic} · {isFlipped ? 'VERSO (RESPOSTA)' : 'FRENTE (PERGUNTA)'}
              </span>

              <p className="text-sm sm:text-base font-black text-[#1e293b] my-4">
                {isFlipped ? FLASHCARDS[flashcardIndex]!.back : FLASHCARDS[flashcardIndex]!.front}
              </p>

              <span className="text-2xs font-bold text-slate-400">
                Clique para virar o cartão ↻
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex(prev => (prev > 0 ? prev - 1 : FLASHCARDS.length - 1));
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-[#1e293b] border-2 border-slate-300 transition-colors cursor-pointer"
              >
                ← Anterior
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex(prev => (prev < FLASHCARDS.length - 1 ? prev + 1 : 0));
                }}
                className="px-4 py-2 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-black border-2 border-[#1e293b] shadow-2xs transition-colors cursor-pointer"
              >
                Próximo Cartão →
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* --- MODAL: CRIAR NOVO CURSO DO CAMPUS --- */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl border-3 border-[#1e293b] shadow-hard-black p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#E6F4EA] border-2 border-[#34A853] text-[#34A853] flex items-center justify-center shadow-2xs">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1e293b]">Criar Curso para seu Campus</h3>
                  <p className="text-2xs text-[#64748b] font-medium">Disponibilize oficinas e trilhas acadêmicas para os estudantes.</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Título do Curso ou Workshop *</label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="Ex: Workshop Prático de IA e RAG na USP"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Ementa / Descrição Curta *</label>
                <textarea
                  rows={2}
                  required
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                  placeholder="Objetivos do curso, metodologia e o que os alunos irão aprender..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Campus / Universidade *</label>
                  <select
                    value={newCourseCampus}
                    onChange={(e) => {
                      setNewCourseCampus(e.target.value);
                      const name = e.target.options[e.target.selectedIndex]?.text || '';
                      setNewCourseCampusName(name);
                    }}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4] font-bold"
                  >
                    <option value="usp">Universidade de São Paulo (USP)</option>
                    <option value="unicamp">Universidade Estadual de Campinas (UNICAMP)</option>
                    <option value="ufrj">Universidade Federal do Rio de Janeiro (UFRJ)</option>
                    <option value="ufmg">Universidade Federal de Minas Gerais (UFMG)</option>
                    <option value="ufpe">Universidade Federal de Pernambuco (UFPE)</option>
                    <option value="unb">Universidade de Brasília (UnB)</option>
                    <option value="puc">Pontifícia Universidade Católica (PUC)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Área / Categoria *</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4] font-bold"
                  >
                    <option value="ia-prompts">IA &amp; Prompts</option>
                    <option value="arquitetura">Arquitetura de LLMs</option>
                    <option value="pesquisa">Rigor Científico &amp; TCC</option>
                    <option value="computacao">Programação &amp; Software</option>
                    <option value="dados">Data Science</option>
                    <option value="metodologias">Metodologias &amp; Anki</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Nível de Dificuldade</label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4] font-bold"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1e293b]">Duração Estimada</label>
                  <input
                    type="text"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    placeholder="Ex: 3h 30m"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#1e293b]">Título da 1ª Lição Prática</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ex: 1.1 Configurando o Ambiente e Primeiros Prompts"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-300 rounded-xl text-[#1e293b] focus:outline-none focus:border-[#4285F4]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2E954B] text-white font-black text-xs border-2 border-[#1e293b] shadow-hard-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={15} />
                  <span>Publicar no Campus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentAIGuidePage;
