# Modal System - Fixy Backoffice

Sistema de modais padronizado e reutilizável para toda a plataforma.

## 🎯 Objetivo

Garantir consistência visual e de comportamento em todos os modais da aplicação, reduzindo duplicação de código e facilitando manutenção.

## 📦 Componentes Disponíveis

### 1. Modal (Base)
Modal base com funcionalidades essenciais e componentes compostos.

```tsx
import { Modal } from "@/components/ui/modal";

<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="md" // sm | md | lg | xl | full
  showCloseButton={true}
  closeOnBackdrop={true}
  closeOnEscape={true}
>
  {/* Conteúdo livre */}
</Modal>
```

### 2. ModalSimple
Modal simplificado com título e subtítulo integrados - ideal para formulários.

```tsx
import { ModalSimple } from "@/components/ui/modal";

<ModalSimple
  isOpen={isOpen}
  onClose={onClose}
  title="Título do Modal"
  subtitle="Descrição opcional"
  maxWidth="2xl" // sm | md | lg | xl | 2xl
  closeOnBackdrop={false}
  closeOnEscape={true}
>
  {/* Conteúdo do formulário */}
</ModalSimple>
```

**Quando usar ModalSimple:**
- Formulários de criação/edição
- Modais com estrutura simples
- Quando não precisa de componentes compostos (Header, Body, Footer)

### 3. ModalHeader
Cabeçalho padronizado com título, subtítulo e ícone opcional.

```tsx
import { ModalHeader } from "@/components/ui/modal/ModalHeader";

<ModalHeader
  title="Título do Modal"
  subtitle="Descrição opcional"
  icon={<svg>...</svg>}
  iconBgColor="bg-brand-100 dark:bg-brand-900/30"
  iconColor="text-brand-600 dark:text-brand-400"
/>
```

### 3. ModalBody
Corpo do modal com padding padronizado.

```tsx
import { ModalBody } from "@/components/ui/modal/ModalBody";

<ModalBody noPadding={false}>
  {/* Conteúdo */}
</ModalBody>
```

### 4. ModalFooter
Rodapé com botões de ação.

```tsx
import { ModalFooter } from "@/components/ui/modal/ModalFooter";

<ModalFooter align="right"> {/* left | center | right */}
  <Button variant="outline" onClick={onClose}>Cancel</Button>
  <Button onClick={onConfirm}>Confirm</Button>
</ModalFooter>
```

### 5. ModalAlert
Alertas contextuais dentro do modal.

```tsx
import { ModalAlert } from "@/components/ui/modal/ModalAlert";

<ModalAlert type="warning" title="Atenção">
  Esta ação não pode ser desfeita.
</ModalAlert>
```

Tipos disponíveis: `info` | `warning` | `error` | `success`

### 6. ModalUserInfo
Card de informações do usuário.

```tsx
import { ModalUserInfo } from "@/components/ui/modal/ModalUserInfo";

<ModalUserInfo
  user={{
    id: "123",
    full_name: "João Silva",
    email: "joao@example.com",
    role: "provider",
    avatar_url: "https://..."
  }}
  description="Você está prestes a modificar este usuário:"
/>
```

### 7. ModalConfirmation
Modal de confirmação pré-configurado.

```tsx
import { ModalConfirmation } from "@/components/ui/modal/ModalConfirmation";

<ModalConfirmation
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirmar Ação"
  description="Tem certeza que deseja continuar?"
  confirmText="Sim, continuar"
  cancelText="Cancelar"
  confirmVariant="danger" // default | danger
  loading={loading}
  icon={<svg>...</svg>}
/>
```

## 🎨 Padrões Visuais

### Tamanhos
- `sm`: 384px (max-w-md)
- `md`: 512px (max-w-lg) - **padrão**
- `lg`: 672px (max-w-2xl)
- `xl`: 896px (max-w-4xl)
- `full`: largura total com margem

### Cores e Estilos
- **Backdrop**: `bg-black/50 backdrop-blur-sm`
- **Container**: `rounded-2xl bg-white dark:bg-gray-800 shadow-2xl`
- **Z-index**: `z-999999`
- **Max Height**: `max-h-[90vh]` com scroll automático

## 📝 Exemplos Completos

### Modal Simples
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";

function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button onClick={openModal}>Abrir Modal</Button>
      
      <Modal isOpen={isOpen} onClose={closeModal} size="md">
        <ModalHeader title="Meu Modal" subtitle="Descrição do modal" />
        <ModalBody>
          <p>Conteúdo do modal aqui...</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={closeModal}>Fechar</Button>
          <Button onClick={handleSave}>Salvar</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
```

### Modal de Confirmação com Alerta
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalAlert } from "@/components/ui/modal";

<Modal isOpen={isOpen} onClose={onClose} size="sm">
  <ModalHeader
    title="Excluir Item"
    icon={
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    }
    iconBgColor="bg-red-100 dark:bg-red-900/30"
    iconColor="text-red-600 dark:text-red-400"
  />
  <ModalBody>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Tem certeza que deseja excluir este item?
    </p>
    <ModalAlert type="error" title="Atenção">
      Esta ação não pode ser desfeita.
    </ModalAlert>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={onClose}>Cancelar</Button>
    <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
      Excluir
    </Button>
  </ModalFooter>
</Modal>
```

### Modal com Informações do Usuário
```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalUserInfo } from "@/components/ui/modal";

<Modal isOpen={isOpen} onClose={onClose} size="md">
  <ModalHeader
    title="Resetar Senha"
    subtitle="Esta ação requer confirmação"
    icon={<svg>...</svg>}
  />
  <ModalBody>
    <ModalUserInfo
      user={user}
      description="Você está prestes a resetar a senha de:"
    />
    {/* Resto do formulário */}
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={onClose}>Cancelar</Button>
    <Button onClick={onConfirm}>Confirmar</Button>
  </ModalFooter>
</Modal>
```

## 🔧 Hook useModal

Utilize o hook `useModal` para gerenciar o estado do modal:

```tsx
import { useModal } from "@/hooks/useModal";

const { isOpen, openModal, closeModal, toggleModal } = useModal();
```

## ✅ Checklist de Migração

Ao migrar modais existentes para o novo padrão:

- [ ] Substituir implementação inline por componentes do sistema
- [ ] Usar `Modal` base com props padronizadas
- [ ] Estruturar com `ModalHeader`, `ModalBody`, `ModalFooter`
- [ ] Aplicar `ModalAlert` para avisos e alertas
- [ ] Usar `ModalUserInfo` quando exibir dados de usuário
- [ ] Remover código duplicado de backdrop, z-index, etc
- [ ] Testar funcionalidade de ESC e click no backdrop
- [ ] Verificar responsividade e dark mode
- [ ] Validar acessibilidade (ARIA, focus trap)

## 🎯 Benefícios

✅ **Consistência**: Interface uniforme em toda plataforma
✅ **Manutenibilidade**: Mudanças centralizadas
✅ **Produtividade**: Menos código para escrever
✅ **Acessibilidade**: Padrões ARIA implementados
✅ **Responsividade**: Funciona em todos os tamanhos de tela
✅ **Dark Mode**: Suporte nativo
