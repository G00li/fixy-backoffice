# 📅 Booking System Components

Sistema completo de agendamentos para a plataforma Fixy, permitindo que clientes agendem serviços com providers e que providers gerenciem sua agenda.

---

## 📦 Componentes Disponíveis

### 1. **BookingCard** 
Cartão individual de agendamento com informações resumidas e ações rápidas.

**Props:**
```typescript
interface BookingCardProps {
  booking: BookingWithDetails;
  isProvider?: boolean;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<BookingCard
  booking={booking}
  isProvider={true}
  onApprove={handleApprove}
  onReject={handleReject}
  onCancel={handleCancel}
  onComplete={handleComplete}
  onViewDetails={handleViewDetails}
/>
```

**Features:**
- ✅ Exibe informações do serviço, data/hora, cliente/provider
- ✅ Status badge colorido
- ✅ Ações contextuais baseadas no status
- ✅ Informações de contato (para providers)
- ✅ Responsive design
- ✅ Dark mode

---

### 2. **BookingsList**
Lista de agendamentos com filtros, busca e agrupamento por status.

**Props:**
```typescript
interface BookingsListProps {
  bookings: BookingWithDetails[];
  isProvider?: boolean;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onComplete?: (bookingId: string) => void;
  onViewDetails?: (bookingId: string) => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<BookingsList
  bookings={bookings}
  isProvider={true}
  onApprove={handleApprove}
  onReject={handleReject}
  onCancel={handleCancel}
  onComplete={handleComplete}
  onViewDetails={handleViewDetails}
/>
```

**Features:**
- ✅ Filtro por status (pendente, confirmado, concluído, cancelado)
- ✅ Busca por cliente/serviço
- ✅ Agrupamento automático por status
- ✅ Contador de resultados
- ✅ Empty state
- ✅ Integração com BookingCard

---

### 3. **AvailableSlotsList**
Lista de horários disponíveis para agendamento com seleção visual.

**Props:**
```typescript
interface AvailableSlotsListProps {
  slots: AvailableSlot[];
  selectedSlot?: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  isLoading?: boolean;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<AvailableSlotsList
  slots={availableSlots}
  selectedSlot={selectedSlot}
  onSelectSlot={setSelectedSlot}
  isLoading={isLoadingSlots}
/>
```

**Features:**
- ✅ Agrupamento por período (manhã, tarde, noite)
- ✅ Visualização em grade ou lista
- ✅ Indicação visual de slot selecionado
- ✅ Loading state
- ✅ Empty state
- ✅ Contador de horários disponíveis

---

### 4. **BookingForm**
Formulário completo de criação de agendamento com wizard de 4 etapas.

**Props:**
```typescript
interface BookingFormProps {
  providerId: string;
  services: Service[];
  onSuccess?: (bookingId: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<BookingForm
  providerId={providerId}
  services={services}
  onSuccess={(bookingId) => {
    router.push(`/bookings/${bookingId}`);
  }}
  onCancel={() => router.back()}
/>
```

**Features:**
- ✅ Wizard de 4 etapas (Serviço → Data/Hora → Detalhes → Confirmar)
- ✅ Seleção de serviço
- ✅ Seleção de data (próximos 30 dias)
- ✅ Integração com AvailableSlotsList
- ✅ Campo de notas (opcional)
- ✅ Resumo antes de confirmar
- ✅ Validações client-side
- ✅ Loading states
- ✅ Error handling

**Fluxo:**
1. **Serviço:** Cliente seleciona o serviço desejado
2. **Data/Hora:** Cliente escolhe data e horário disponível
3. **Detalhes:** Cliente adiciona notas (opcional)
4. **Confirmar:** Cliente revisa e confirma o agendamento

---

### 5. **BlockTimeSlotForm**
Formulário para providers bloquearem horários na agenda.

**Props:**
```typescript
interface BlockTimeSlotFormProps {
  onSuccess?: (slotId: string) => void;
  onCancel?: () => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<BlockTimeSlotForm
  onSuccess={(slotId) => {
    toast.success('Horário bloqueado com sucesso');
    reloadSchedule();
  }}
  onCancel={() => setShowBlockForm(false)}
/>
```

**Features:**
- ✅ Seleção de data/hora de início e fim
- ✅ Motivo do bloqueio (dropdown)
- ✅ Suporte a recorrência (diária, semanal, mensal)
- ✅ Seleção de dias da semana (para recorrência semanal)
- ✅ Data de término da recorrência
- ✅ Validações (fim > início)
- ✅ Loading state
- ✅ Error handling

**Casos de Uso:**
- Férias
- Compromissos pessoais
- Manutenção
- Treinamento
- Bloqueios recorrentes (ex: almoço diário)

---

### 6. **BookingDetailsModal**
Modal com detalhes completos do agendamento e ações disponíveis.

**Props:**
```typescript
interface BookingDetailsModalProps {
  booking: BookingWithDetails;
  isProvider?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string, reason?: string) => void;
  onCancel?: (bookingId: string, reason?: string) => void;
  onComplete?: (bookingId: string) => void;
}
```

**Exemplo de Uso:**
```tsx
<BookingDetailsModal
  booking={selectedBooking}
  isProvider={true}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onApprove={handleApprove}
  onReject={handleReject}
  onCancel={handleCancel}
  onComplete={handleComplete}
/>
```

**Features:**
- ✅ Informações completas do agendamento
- ✅ Dados do cliente/provider com avatar
- ✅ Informações de contato (email, telefone)
- ✅ Notas do cliente
- ✅ Motivo de cancelamento (se aplicável)
- ✅ Timestamps (criado, atualizado)
- ✅ Formulário inline para recusa/cancelamento com motivo
- ✅ Ações contextuais no footer
- ✅ Backdrop com click-to-close
- ✅ Scroll interno para conteúdo longo

---

### 7. **BookingCalendar**
Calendário visual mensal com indicação de agendamentos.

**Props:**
```typescript
interface BookingCalendarProps {
  bookings: BookingWithDetails[];
  onDateClick?: (date: Date) => void;
  onBookingClick?: (booking: BookingWithDetails) => void;
  className?: string;
}
```

**Exemplo de Uso:**
```tsx
<BookingCalendar
  bookings={bookings}
  onDateClick={(date) => {
    setSelectedDate(date);
    setShowDayView(true);
  }}
  onBookingClick={(booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  }}
/>
```

**Features:**
- ✅ Visualização mensal
- ✅ Navegação entre meses
- ✅ Botão "Hoje" para voltar ao mês atual
- ✅ Indicação visual de agendamentos por dia
- ✅ Cores por status (pendente, confirmado, concluído, cancelado)
- ✅ Até 3 agendamentos visíveis por dia
- ✅ Indicador "+X" para dias com mais de 3 agendamentos
- ✅ Click em dia para ver todos os agendamentos
- ✅ Click em agendamento para ver detalhes
- ✅ Legenda de cores
- ✅ Destaque do dia atual

---

## 📄 Páginas

### 1. **`/providers/[id]/book`**
Página de agendamento onde clientes agendam serviços com um provider específico.

**Features:**
- ✅ Informações do provider (avatar, nome, bio)
- ✅ Lista de serviços disponíveis
- ✅ Integração com BookingForm
- ✅ Redirect após sucesso
- ✅ Empty state (sem serviços)
- ✅ Info box com instruções

---

### 2. **`/bookings`**
Página de agendamentos do cliente.

**Features:**
- ✅ Cards de estatísticas (total, pendentes, confirmados, concluídos)
- ✅ Integração com BookingsList
- ✅ Empty state com CTA para buscar providers
- ✅ Help box com explicação de status
- ✅ Responsive layout

---

### 3. **`/providers/[id]/schedule`**
Página de agenda do provider (já existente).

**Features:**
- ✅ Integração com BookingsList
- ✅ Filtros e busca
- ✅ Ações de aprovação/recusa/cancelamento/conclusão

---

## 🔧 Actions (Server-Side)

Todas as ações estão em `@/app/actions/bookings.ts`:

### Para Clientes:
- `getAvailableSlots(params)` - Buscar horários disponíveis
- `createBooking(params)` - Criar agendamento
- `getClientBookings(filters?)` - Listar agendamentos do cliente
- `cancelBooking(params)` - Cancelar agendamento

### Para Providers:
- `getProviderBookings(filters?)` - Listar agendamentos do provider
- `approveBooking(bookingId)` - Aprovar agendamento
- `rejectBooking(params)` - Recusar agendamento
- `completeBooking(bookingId)` - Concluir agendamento
- `blockTimeSlot(params)` - Bloquear horário
- `unblockTimeSlot(slotId)` - Desbloquear horário
- `getBlockedSlots(providerId, startDate?, endDate?)` - Listar horários bloqueados

### Compartilhadas:
- `getBookingById(bookingId)` - Buscar agendamento por ID

---

## 🎨 Tipos TypeScript

Todos os tipos estão em `@/types/bookings.ts`:

### Principais Interfaces:
- `Booking` - Agendamento básico
- `BookingWithDetails` - Agendamento com dados de cliente/provider/serviço
- `AvailableSlot` - Slot de horário disponível
- `BlockedTimeSlot` - Horário bloqueado
- `RecurrencePattern` - Padrão de recorrência
- `AvailabilitySchedule` - Horário de funcionamento

### Enums e Constantes:
- `BookingStatus` - Status do agendamento
- `BOOKING_STATUS_LABELS` - Labels em português
- `BOOKING_STATUS_COLORS` - Classes Tailwind para cores
- `DAY_OF_WEEK_LABELS` - Dias da semana
- `BOOKING_VALIDATION` - Constantes de validação

---

## 🗄️ Banco de Dados

### Tabelas:
- `bookings` - Agendamentos
- `blocked_time_slots` - Horários bloqueados
- `availability_schedules` - Horários de funcionamento

### Funções SQL:
- `get_available_slots()` - Calcula slots disponíveis
- `create_booking()` - Cria agendamento com validações
- `approve_booking()` - Aprova agendamento
- `reject_booking()` - Recusa agendamento
- `cancel_booking()` - Cancela agendamento
- `block_time_slot()` - Bloqueia horário
- `unblock_time_slot()` - Desbloqueia horário
- `check_booking_conflicts()` - Verifica conflitos
- `validate_booking_time()` - Valida horário
- `get_provider_availability()` - Busca disponibilidade

### Views:
- `provider_bookings_view` - View com dados completos de agendamentos

---

## 🎯 Fluxos de Uso

### Fluxo do Cliente:

1. **Buscar Provider**
   - Cliente busca providers na página `/search`
   - Visualiza perfil do provider

2. **Agendar Serviço**
   - Cliente acessa `/providers/[id]/book`
   - Seleciona serviço
   - Escolhe data e horário disponível
   - Adiciona notas (opcional)
   - Confirma agendamento

3. **Acompanhar Agendamento**
   - Cliente acessa `/bookings`
   - Visualiza status do agendamento
   - Pode cancelar se necessário

### Fluxo do Provider:

1. **Receber Solicitação**
   - Provider recebe notificação de novo agendamento
   - Acessa `/providers/[id]/schedule`
   - Visualiza agendamento pendente

2. **Aprovar/Recusar**
   - Provider revisa detalhes
   - Aprova ou recusa com motivo

3. **Gerenciar Agenda**
   - Provider bloqueia horários (férias, compromissos)
   - Visualiza agenda em calendário
   - Marca agendamentos como concluídos

---

## 🔐 Segurança

### RLS Policies:
- ✅ Clientes veem apenas seus próprios agendamentos
- ✅ Providers veem apenas agendamentos relacionados a eles
- ✅ Validação de permissões em todas as ações
- ✅ Proteção contra SQL injection

### Validações:
- ✅ Não permitir agendamento no passado
- ✅ Respeitar antecedência mínima
- ✅ Respeitar limite máximo de antecedência
- ✅ Verificar conflitos de horário
- ✅ Verificar horários bloqueados
- ✅ Validar política de cancelamento

---

## 🎨 Estilização

### Tailwind CSS:
- ✅ Design system consistente
- ✅ Dark mode completo
- ✅ Responsive (mobile-first)
- ✅ Cores por status
- ✅ Animações e transições

### Cores por Status:
- 🟡 **Pendente:** Yellow (aguardando aprovação)
- 🟢 **Confirmado:** Green (aprovado)
- 🔵 **Concluído:** Blue (serviço realizado)
- 🔴 **Cancelado:** Red (cancelado)

---

## 📱 Responsividade

Todos os componentes são totalmente responsivos:

- **Mobile (< 640px):** Layout em coluna, botões full-width
- **Tablet (640px - 1024px):** Layout híbrido, 2 colunas
- **Desktop (> 1024px):** Layout completo, 3-4 colunas

---

## ♿ Acessibilidade

- ✅ ARIA labels em todos os botões
- ✅ Navegação por teclado
- ✅ Contraste adequado (WCAG AA)
- ✅ Focus states visíveis
- ✅ Mensagens de erro descritivas

---

## 🧪 Testes Sugeridos

### Unit Tests:
- Validações de formulário
- Cálculo de slots disponíveis
- Formatação de datas
- Filtros e busca

### Integration Tests:
- Fluxo completo de agendamento
- Aprovação/recusa de agendamentos
- Bloqueio de horários
- Cancelamento com políticas

### E2E Tests:
- Cliente agenda serviço
- Provider aprova agendamento
- Provider bloqueia horário
- Cliente cancela agendamento

---

## 🚀 Melhorias Futuras

### Funcionalidades:
- [ ] Notificações em tempo real (WebSocket)
- [ ] Integração com calendários externos (Google, Outlook)
- [ ] Agendamentos recorrentes para clientes
- [ ] Sistema de lembretes automáticos
- [ ] Avaliações após conclusão
- [ ] Pagamento integrado
- [ ] Chat integrado
- [ ] Exportar agenda (PDF, iCal)

### UX:
- [ ] Drag & drop no calendário
- [ ] Visualização semanal/diária
- [ ] Timeline de agendamentos
- [ ] Sugestões de horários
- [ ] Confirmação por SMS/WhatsApp

### Performance:
- [ ] Infinite scroll na lista
- [ ] Lazy loading de imagens
- [ ] Cache de slots disponíveis
- [ ] Optimistic updates

---

## 📚 Documentação Adicional

- [Plano da Fase 2.5](../../docs/plano/02-role-provider.md)
- [Status da Implementação](../../docs/fase-2.5-FINAL.md)
- [Migration SQL](../../../fixy-supabase/supabase/migrations/20260104000000_booking_system_functions.sql)

---

## 🤝 Contribuindo

Ao adicionar novos componentes ou features:

1. Siga os padrões existentes
2. Use TypeScript com tipos estritos
3. Adicione documentação inline
4. Teste em mobile e desktop
5. Verifique dark mode
6. Adicione error handling
7. Atualize este README

---

**Última atualização:** 2026-01-04  
**Versão:** 1.0.0  
**Status:** ✅ Completo (100%)
