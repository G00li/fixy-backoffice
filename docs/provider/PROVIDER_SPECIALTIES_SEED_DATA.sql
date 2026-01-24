-- ============================================
-- Seed Data: Categories and Specialty Tags
-- Description: Dados iniciais para o sistema de especialidades
-- ============================================

-- ============================================================================
-- CATEGORIAS PRINCIPAIS (Level 1)
-- ============================================================================

INSERT INTO categories (id, name, slug, description, keywords, level, display_order, is_active) VALUES
  -- Beleza e Estética
  ('11111111-1111-1111-1111-111111111111', 'Beleza e Estética', 'beleza-estetica', 
   'Serviços de beleza, estética e cuidados pessoais', 
   ARRAY['beleza', 'estética', 'cabelo', 'maquiagem', 'unhas', 'spa'], 
   1, 1, true),
  
  -- Saúde e Bem-Estar
  ('22222222-2222-2222-2222-222222222222', 'Saúde e Bem-Estar', 'saude-bem-estar',
   'Serviços de saúde, terapias e bem-estar',
   ARRAY['saúde', 'bem-estar', 'massagem', 'fisioterapia', 'terapia'],
   1, 2, true),
  
  -- Fitness e Desporto
  ('33333333-3333-3333-3333-333333333333', 'Fitness e Desporto', 'fitness-desporto',
   'Personal training, aulas de fitness e desporto',
   ARRAY['fitness', 'desporto', 'treino', 'academia', 'yoga'],
   1, 3, true),
  
  -- Reparações e Manutenção
  ('44444444-4444-4444-4444-444444444444', 'Reparações e Manutenção', 'reparacoes-manutencao',
   'Serviços de reparação e manutenção doméstica',
   ARRAY['reparações', 'manutenção', 'eletricista', 'canalizador', 'pintor'],
   1, 4, true),
  
  -- Limpeza
  ('55555555-5555-5555-5555-555555555555', 'Limpeza', 'limpeza',
   'Serviços de limpeza residencial e comercial',
   ARRAY['limpeza', 'higienização', 'desinfecção', 'organização'],
   1, 5, true),
  
  -- Educação e Formação
  ('66666666-6666-6666-6666-666666666666', 'Educação e Formação', 'educacao-formacao',
   'Aulas particulares, cursos e formação',
   ARRAY['educação', 'formação', 'aulas', 'explicações', 'cursos'],
   1, 6, true),
  
  -- Eventos e Entretenimento
  ('77777777-7777-7777-7777-777777777777', 'Eventos e Entretenimento', 'eventos-entretenimento',
   'Organização de eventos e entretenimento',
   ARRAY['eventos', 'festas', 'animação', 'fotografia', 'música'],
   1, 7, true),
  
  -- Consultoria e Serviços Profissionais
  ('88888888-8888-8888-8888-888888888888', 'Consultoria e Serviços Profissionais', 'consultoria-servicos',
   'Consultoria, assessoria e serviços profissionais',
   ARRAY['consultoria', 'assessoria', 'contabilidade', 'jurídico', 'marketing'],
   1, 8, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUBCATEGORIAS (Level 2) - BELEZA E ESTÉTICA
-- ============================================================================

INSERT INTO categories (id, parent_id, name, slug, description, keywords, level, display_order, is_active) VALUES
  -- Cabelo
  ('11111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111111', 
   'Cabelo', 'cabelo', 'Serviços de cabeleireiro e tratamentos capilares',
   ARRAY['cabelo', 'corte', 'coloração', 'penteado', 'tratamento'], 2, 1, true),
  
  -- Maquiagem
  ('11111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111111',
   'Maquiagem', 'maquiagem', 'Serviços de maquiagem profissional',
   ARRAY['maquiagem', 'makeup', 'noivas', 'eventos', 'automaquiagem'], 2, 2, true),
  
  -- Unhas
  ('11111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111111',
   'Unhas', 'unhas', 'Manicure, pedicure e nail art',
   ARRAY['unhas', 'manicure', 'pedicure', 'nail art', 'gel'], 2, 3, true),
  
  -- Estética Facial
  ('11111111-1111-1111-1111-111111111104', '11111111-1111-1111-1111-111111111111',
   'Estética Facial', 'estetica-facial', 'Tratamentos faciais e cuidados com a pele',
   ARRAY['facial', 'pele', 'limpeza', 'hidratação', 'rejuvenescimento'], 2, 4, true),
  
  -- Estética Corporal
  ('11111111-1111-1111-1111-111111111105', '11111111-1111-1111-1111-111111111111',
   'Estética Corporal', 'estetica-corporal', 'Tratamentos corporais e modelagem',
   ARRAY['corporal', 'massagem', 'drenagem', 'modelagem', 'celulite'], 2, 5, true),
  
  -- Depilação
  ('11111111-1111-1111-1111-111111111106', '11111111-1111-1111-1111-111111111111',
   'Depilação', 'depilacao', 'Serviços de depilação',
   ARRAY['depilação', 'cera', 'laser', 'linha'], 2, 6, true),
  
  -- Sobrancelhas e Cílios
  ('11111111-1111-1111-1111-111111111107', '11111111-1111-1111-1111-111111111111',
   'Sobrancelhas e Cílios', 'sobrancelhas-cilios', 'Design de sobrancelhas e extensão de cílios',
   ARRAY['sobrancelhas', 'cílios', 'design', 'henna', 'extensão'], 2, 7, true),
  
  -- Barbeiro
  ('11111111-1111-1111-1111-111111111108', '11111111-1111-1111-1111-111111111111',
   'Barbeiro', 'barbeiro', 'Serviços de barbearia masculina',
   ARRAY['barbeiro', 'barba', 'corte masculino', 'navalha', 'aparar'], 2, 8, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUBCATEGORIAS (Level 2) - SAÚDE E BEM-ESTAR
-- ============================================================================

INSERT INTO categories (id, parent_id, name, slug, description, keywords, level, display_order, is_active) VALUES
  -- Massagem
  ('22222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222222',
   'Massagem', 'massagem', 'Massagens terapêuticas e relaxantes',
   ARRAY['massagem', 'relaxante', 'terapêutica', 'desportiva', 'shiatsu'], 2, 1, true),
  
  -- Fisioterapia
  ('22222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222222',
   'Fisioterapia', 'fisioterapia', 'Tratamentos fisioterapêuticos',
   ARRAY['fisioterapia', 'reabilitação', 'lesões', 'postura'], 2, 2, true),
  
  -- Nutrição
  ('22222222-2222-2222-2222-222222222203', '22222222-2222-2222-2222-222222222222',
   'Nutrição', 'nutricao', 'Consultoria nutricional e dietética',
   ARRAY['nutrição', 'dieta', 'alimentação', 'emagrecimento'], 2, 3, true),
  
  -- Psicologia
  ('22222222-2222-2222-2222-222222222204', '22222222-2222-2222-2222-222222222222',
   'Psicologia', 'psicologia', 'Consultas de psicologia e terapia',
   ARRAY['psicologia', 'terapia', 'ansiedade', 'depressão', 'coaching'], 2, 4, true),
  
  -- Acupuntura
  ('22222222-2222-2222-2222-222222222205', '22222222-2222-2222-2222-222222222222',
   'Acupuntura', 'acupuntura', 'Tratamentos de acupuntura',
   ARRAY['acupuntura', 'medicina chinesa', 'agulhas'], 2, 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUBCATEGORIAS (Level 2) - FITNESS E DESPORTO
-- ============================================================================

INSERT INTO categories (id, parent_id, name, slug, description, keywords, level, display_order, is_active) VALUES
  -- Personal Training
  ('33333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333333',
   'Personal Training', 'personal-training', 'Treino personalizado',
   ARRAY['personal', 'treino', 'musculação', 'emagrecimento'], 2, 1, true),
  
  -- Yoga
  ('33333333-3333-3333-3333-333333333302', '33333333-3333-3333-3333-333333333333',
   'Yoga', 'yoga', 'Aulas de yoga',
   ARRAY['yoga', 'meditação', 'flexibilidade', 'hatha', 'vinyasa'], 2, 2, true),
  
  -- Pilates
  ('33333333-3333-3333-3333-333333333303', '33333333-3333-3333-3333-333333333333',
   'Pilates', 'pilates', 'Aulas de pilates',
   ARRAY['pilates', 'postura', 'core', 'alongamento'], 2, 3, true),
  
  -- Artes Marciais
  ('33333333-3333-3333-3333-333333333304', '33333333-3333-3333-3333-333333333333',
   'Artes Marciais', 'artes-marciais', 'Treino de artes marciais',
   ARRAY['artes marciais', 'karate', 'judo', 'muay thai', 'boxe'], 2, 4, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SPECIALTY TAGS - CABELO
-- ============================================================================

INSERT INTO category_specialty_tags (category_id, tag_name, tag_slug, description, is_approved, is_suggested) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Corte Masculino', 'corte-masculino', 'Especialista em cortes masculinos', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Corte Feminino', 'corte-feminino', 'Especialista em cortes femininos', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Coloração', 'coloracao', 'Coloração e mechas', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Alisamento', 'alisamento', 'Alisamentos e progressivas', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Penteados', 'penteados', 'Penteados para eventos', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Tratamentos Capilares', 'tratamentos-capilares', 'Tratamentos e hidratação', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Cabelos Cacheados', 'cabelos-cacheados', 'Especialista em cabelos cacheados', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Cabelos Afro', 'cabelos-afro', 'Especialista em cabelos afro', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Luzes e Mechas', 'luzes-mechas', 'Luzes, mechas e balayage', true, true),
  ('11111111-1111-1111-1111-111111111101', 'Corte Infantil', 'corte-infantil', 'Cortes para crianças', true, true)
ON CONFLICT (category_id, tag_slug) DO NOTHING;

-- ============================================================================
-- SPECIALTY TAGS - MAQUIAGEM
-- ============================================================================

INSERT INTO category_specialty_tags (category_id, tag_name, tag_slug, description, is_approved, is_suggested) VALUES
  ('11111111-1111-1111-1111-111111111102', 'Maquiagem Social', 'maquiagem-social', 'Maquiagem para eventos sociais', true, true),
  ('11111111-1111-1111-1111-111111111102', 'Maquiagem para Noivas', 'maquiagem-noivas', 'Especialista em noivas', true, true),
  ('11111111-1111-1111-1111-111111111102', 'Maquiagem Artística', 'maquiagem-artistica', 'Maquiagem artística e caracterização', true, true),
  ('11111111-1111-1111-1111-111111111102', 'Automaquiagem', 'automaquiagem', 'Aulas de automaquiagem', true, true),
  ('11111111-1111-1111-1111-111111111102', 'Maquiagem Profissional', 'maquiagem-profissional', 'Maquiagem para fotos e vídeos', true, true),
  ('11111111-1111-1111-1111-111111111102', 'Maquiagem Pele Negra', 'maquiagem-pele-negra', 'Especialista em pele negra', true, true)
ON CONFLICT (category_id, tag_slug) DO NOTHING;

-- ============================================================================
-- SPECIALTY TAGS - BARBEIRO
-- ============================================================================

INSERT INTO category_specialty_tags (category_id, tag_name, tag_slug, description, is_approved, is_suggested) VALUES
  ('11111111-1111-1111-1111-111111111108', 'Corte Clássico', 'corte-classico', 'Cortes clássicos masculinos', true, true),
  ('11111111-1111-1111-1111-111111111108', 'Corte Moderno', 'corte-moderno', 'Cortes modernos e tendências', true, true),
  ('11111111-1111-1111-1111-111111111108', 'Barba', 'barba', 'Design e manutenção de barba', true, true),
  ('11111111-1111-1111-1111-111111111108', 'Navalha', 'navalha', 'Especialista em navalha', true, true),
  ('11111111-1111-1111-1111-111111111108', 'Degradê', 'degrade', 'Especialista em degradê', true, true),
  ('11111111-1111-1111-1111-111111111108', 'Pigmentação', 'pigmentacao', 'Pigmentação de barba e cabelo', true, true)
ON CONFLICT (category_id, tag_slug) DO NOTHING;

-- ============================================================================
-- SPECIALTY TAGS - MASSAGEM
-- ============================================================================

INSERT INTO category_specialty_tags (category_id, tag_name, tag_slug, description, is_approved, is_suggested) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Massagem Relaxante', 'massagem-relaxante', 'Massagem para relaxamento', true, true),
  ('22222222-2222-2222-2222-222222222201', 'Massagem Terapêutica', 'massagem-terapeutica', 'Massagem terapêutica', true, true),
  ('22222222-2222-2222-2222-222222222201', 'Massagem Desportiva', 'massagem-desportiva', 'Massagem para atletas', true, true),
  ('22222222-2222-2222-2222-222222222201', 'Shiatsu', 'shiatsu', 'Massagem shiatsu', true, true),
  ('22222222-2222-2222-2222-222222222201', 'Drenagem Linfática', 'drenagem-linfatica', 'Drenagem linfática', true, true),
  ('22222222-2222-2222-2222-222222222201', 'Massagem com Pedras', 'massagem-pedras', 'Massagem com pedras quentes', true, true)
ON CONFLICT (category_id, tag_slug) DO NOTHING;

-- ============================================================================
-- SPECIALTY TAGS - PERSONAL TRAINING
-- ============================================================================

INSERT INTO category_specialty_tags (category_id, tag_name, tag_slug, description, is_approved, is_suggested) VALUES
  ('33333333-3333-3333-3333-333333333301', 'Emagrecimento', 'emagrecimento', 'Treino para emagrecimento', true, true),
  ('33333333-3333-3333-3333-333333333301', 'Hipertrofia', 'hipertrofia', 'Treino para ganho de massa', true, true),
  ('33333333-3333-3333-3333-333333333301', 'Funcional', 'funcional', 'Treino funcional', true, true),
  ('33333333-3333-3333-3333-333333333301', 'HIIT', 'hiit', 'Treino intervalado de alta intensidade', true, true),
  ('33333333-3333-3333-3333-333333333301', 'Idosos', 'idosos', 'Treino para terceira idade', true, true),
  ('33333333-3333-3333-3333-333333333301', 'Gestantes', 'gestantes', 'Treino para gestantes', true, true),
  ('33333333-3333-3333-3333-333333333301', 'Reabilitação', 'reabilitacao', 'Treino de reabilitação', true, true)
ON CONFLICT (category_id, tag_slug) DO NOTHING;

-- ============================================================================
-- FIM DO SEED DATA
-- ============================================================================
