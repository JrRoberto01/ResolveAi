export const userData = {
    avatarUrl: "https://i.pravatar.cc/150?u=joao",
    name: "João da Silva",
    location: "São Paulo, SP",
    memberSince: "Membro desde Março de 2023",
    stats: {
        occurrences: "12",
        supports: "45",
    },
};

export const occurrences = [
    {
        id: '1',
        imageUrl: "https://picsum.photos/id/10/200",
        title: "Buraco na Av. Paulista",
        subtitle: "Há 2 dias • Infraestrutura",
        status: "Em análise",
    },
    {
        id: '2',
        imageUrl: "https://picsum.photos/id/12/200",
        title: "Poste sem luz - Rua Augusta",
        subtitle: "Há 1 semana • Iluminação",
        status: "Resolvido",
    },
];

export const settingsOptions = [
    { icon: "user", text: "Editar Perfil", showDivider: true },
    { icon: "bell", text: "Notificações", showDivider: true },
    { icon: "lock", text: "Privacidade", showDivider: true },
    { icon: "sign-out-alt", text: "Sair", isDanger: true },
];
