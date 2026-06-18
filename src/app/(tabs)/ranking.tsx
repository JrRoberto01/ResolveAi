import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Linking,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import Toast from "react-native-toast-message";
import {
	ApiOccurrence,
	getOccurrence,
	getOccurrenceRanking,
	OccurrenceRanking,
	RankingPeriod,
	toggleOccurrenceSupport,
} from "../../api/occurrences.api";
import type { Ocorrencia } from "../../components/CardOcorrencia";
import { Header } from "../../components/Header";
import { OccurrenceDetails } from "../../components/OccurrenceDetails";
import { colors } from "../../style/colors";
import { globalStyles } from "../../style/global";
import { radii, spacing } from "../../style/spacing";

const RANGE_KM = 25;
const PERIODS: RankingPeriod[] = [7, 30, 60];

type UserLocation = {
	latitude: number;
	longitude: number;
};

const emptyRanking: OccurrenceRanking = {
	filters: {
		days: 7,
		rangeKm: RANGE_KM,
	},
	summary: {
		created: 0,
		supports: 0,
		resolved: 0,
		topCategory: "Sem dados",
	},
	categoryRanking: [],
	topOccurrences: [],
	engagedUsers: [],
	featuredUsers: [],
};

const statusLabels: Record<string, string> = {
	IN_ANALYSIS: "Em análise",
	RESOLVED: "Resolvida",
	REJECTED: "Rejeitada",
};

const detailStatusLabels: Record<ApiOccurrence["status"], string> = {
	IN_ANALYSIS: "EM ANÁLISE",
	RESOLVED: "RESOLVIDO",
	REJECTED: "REJEITADO",
};

function formatTimeAgo(date: string) {
	const createdAt = new Date(date).getTime();
	const diffInMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));

	if (diffInMinutes < 1) return "Agora mesmo";
	if (diffInMinutes < 60) return `${diffInMinutes} min`;

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `${diffInHours}h`;

	const diffInDays = Math.floor(diffInHours / 24);
	return `${diffInDays}d`;
}

function apiOccurrenceToCard(occurrence: ApiOccurrence): Ocorrencia {
	const hasLocation = occurrence.latitude !== null && occurrence.longitude !== null;
	const location = hasLocation
		? {
				latitude: occurrence.latitude,
				longitude: occurrence.longitude,
				address: occurrence.address ?? undefined,
			}
		: occurrence.address ?? "Local marcado no mapa";

	return {
		id: String(occurrence.id),
		title: occurrence.title,
		description: occurrence.description ?? "",
		category: occurrence.category,
		anonymous: occurrence.anonymous,
		location,
		likes: occurrence.supportCount,
		comments: occurrence.commentsCount,
		timeAgo: formatTimeAgo(occurrence.createdAt),
		status: detailStatusLabels[occurrence.status],
		photos: occurrence.photos,
		imageUrl: occurrence.photos.length > 0 ? { uri: occurrence.photos[0] } : undefined,
		supportedByMe: occurrence.supportedByMe,
		canEdit: occurrence.canEdit,
	};
}

function abbreviateCategory(category: string) {
	if (category.length <= 14) return category;
	return `${category.slice(0, 12)}...`;
}

function formatPeriodLabel(days: RankingPeriod) {
	return `Últimos ${days} dias`;
}

function StatCard({
	icon,
	label,
	value,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: string | number;
}) {
	return (
		<View style={styles.statCard}>
			<View style={styles.statIcon}>
				<Ionicons name={icon} size={18} color={colors.primary} />
			</View>
			<Text style={styles.statValue} numberOfLines={1}>
				{value}
			</Text>
			<Text style={styles.statLabel} numberOfLines={2}>
				{label}
			</Text>
		</View>
	);
}

function SectionTitle({ title }: { title: string }) {
	return <Text style={styles.sectionTitle}>{title}</Text>;
}

function EmptyState({ message }: { message: string }) {
	return (
		<View style={styles.emptyState}>
			<Ionicons name="analytics-outline" size={24} color={colors.textSecondary} />
			<Text style={styles.emptyText}>{message}</Text>
		</View>
	);
}

function CategoryChart({ data }: { data: OccurrenceRanking["categoryRanking"] }) {
	const chartData = data.slice(0, 10);
	const maxValue = Math.max(...chartData.map((item) => item.total), 1);
	const shouldScroll = chartData.length > 5;

	if (chartData.length === 0) {
		return <EmptyState message="Nenhuma categoria encontrada no período." />;
	}

	return (
		<View style={styles.chartCard}>
			<ScrollView
				horizontal={shouldScroll}
				scrollEnabled={shouldScroll}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={!shouldScroll ? styles.categoryChartStaticWrapper : undefined}
			>
				<View style={[styles.categoryChart, shouldScroll && styles.categoryChartScrollable]}>
					<View pointerEvents="none" style={styles.chartGuides}>
						{[0, 1, 2, 3].map((guide) => (
							<View key={guide} style={styles.chartGuideLine} />
						))}
					</View>
					{chartData.map((item) => {
						const height = Math.max(24, Math.round((item.total / maxValue) * 132));

						return (
							<View key={item.category} style={styles.categoryBarItem}>
								<Text style={styles.barValue}>{item.total}</Text>
								<View style={[styles.categoryBar, { height }]} />
								<Text style={styles.barLabel} numberOfLines={2}>
									{abbreviateCategory(item.category)}
								</Text>
							</View>
						);
					})}
				</View>
			</ScrollView>
		</View>
	);
}

function EngagementChart({ data }: { data: OccurrenceRanking["engagedUsers"] }) {
	const chartData = data.slice(0, 10);
	const maxValue = Math.max(...chartData.map((item) => item.score), 1);

	if (chartData.length === 0) {
		return <EmptyState message="Nenhum usuário engajado no período." />;
	}

	return (
		<View style={[styles.chartCard, styles.horizontalChartCard]}>
			<View pointerEvents="none" style={styles.horizontalGuides}>
				{[0, 1, 2, 3].map((guide) => (
					<View key={guide} style={styles.horizontalGuideLine} />
				))}
			</View>
			{chartData.map((user, index) => {
				const width = `${Math.max(12, Math.round((user.score / maxValue) * 100))}%` as const;

				return (
					<View key={user.userId} style={styles.userBarRow}>
						<View style={styles.rankBadge}>
							<Text style={styles.rankBadgeText}>{index + 1}</Text>
						</View>
						<View style={styles.userBarContent}>
							<View style={styles.userBarHeader}>
								<Text style={styles.userBarName} numberOfLines={1}>
									{user.name}
								</Text>
								<Text style={styles.userBarScore}>{user.score} pts</Text>
							</View>
							<View style={styles.horizontalTrack}>
								<View style={[styles.horizontalBar, { width }]} />
							</View>
						</View>
					</View>
				);
			})}
		</View>
	);
}

export default function Ranking() {
	const router = useRouter();
	const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>(7);
	const [ranking, setRanking] = useState<OccurrenceRanking>(emptyRanking);
	const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
	const [locationChecked, setLocationChecked] = useState(false);
	const [locationIssue, setLocationIssue] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedOccurrence, setSelectedOccurrence] = useState<Ocorrencia | null>(null);
	const [openingOccurrenceId, setOpeningOccurrenceId] = useState<number | null>(null);

	const showLocationAlert = useCallback((message: string) => {
		Alert.alert(
			"Localização necessaria",
			message,
			[
				{
					text: "Agora não",
					style: "cancel",
				},
				{
					text: "Abrir configurações",
					onPress: () => {
						void Linking.openSettings();
					},
				},
			],
		);
	}, []);

	const loadLocation = useCallback(async () => {
		setLocationChecked(false);
		setLocationIssue(null);

		try {
			const servicesEnabled = await Location.hasServicesEnabledAsync();

			if (!servicesEnabled) {
				const message = "Ative o GPS do dispositivo para visualizar denúncias próximas de você.";
				setUserLocation(null);
				setLocationIssue(message);
				showLocationAlert(message);
				return null;
			}

			const permission = await Location.requestForegroundPermissionsAsync();

			if (permission.status !== "granted") {
				const message = "Este app necessita do acesso a localização para funcionar corretamente, por favor, ajuste nas configurações";
				setUserLocation(null);
				setLocationIssue(message);
				showLocationAlert(message);
				return null;
			}

			const currentPosition = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			const nextLocation = {
				latitude: currentPosition.coords.latitude,
				longitude: currentPosition.coords.longitude,
			};

			setUserLocation(nextLocation);
			setLocationIssue(null);
			return nextLocation;
		} catch {
			const message = "Não foi possível obter sinal de GPS agora. Verifique a localização do aparelho e tente novamente.";
			setUserLocation(null);
			setLocationIssue(message);
			showLocationAlert(message);
			return null;
		} finally {
			setLocationChecked(true);
		}
	}, [showLocationAlert]);

	const loadRanking = useCallback(
		async (showLoading = true, rankingLocation: UserLocation | null) => {
			if (rankingLocation === null) {
				setRanking(emptyRanking);
				setLoading(false);
				setRefreshing(false);
				return;
			}

			try {
				if (showLoading) {
					setLoading(true);
				}

				const data = await getOccurrenceRanking({
					days: selectedPeriod,
					rangeKm: RANGE_KM,
					latitude: rankingLocation.latitude,
					longitude: rankingLocation.longitude,
				});

				setRanking(data);
			} catch (err: any) {
				Toast.show({
					type: "error",
					text1: "Erro ao carregar ranking",
					text2: err?.friendlyMessage || err?.message,
				});
			} finally {
				setLoading(false);
				setRefreshing(false);
			}
		},
		[selectedPeriod],
	);

	useFocusEffect(
		useCallback(() => {
			void (async () => {
				setLoading(true);
				const nextLocation = await loadLocation();
				if (!nextLocation) {
					setLoading(false);
				}
			})();
		}, [loadLocation]),
	);

	useEffect(() => {
		if (locationChecked && userLocation) {
			void loadRanking(true, userLocation);
		}
	}, [loadRanking, locationChecked, userLocation]);

	const locationDescription = useMemo(() => {
		if (userLocation) {
			return `Exibindo dados registrados em um raio de ${RANGE_KM} Km`;
		}

		return locationIssue ?? "Verificando localização para montar o ranking próximo de você.";
	}, [locationIssue, userLocation]);

	async function handleOpenOccurrenceDetails(id: number) {
		try {
			setOpeningOccurrenceId(id);
			const occurrence = await getOccurrence(id);
			setSelectedOccurrence(apiOccurrenceToCard(occurrence));
		} catch (err: any) {
			Toast.show({
				type: "error",
				text1: "Não foi possível abrir a publicação",
				text2: err?.friendlyMessage || err?.message,
			});
		} finally {
			setOpeningOccurrenceId(null);
		}
	}

	async function handleToggleSelectedSupport() {
		if (!selectedOccurrence) {
			return;
		}

		try {
			const result = await toggleOccurrenceSupport(Number(selectedOccurrence.id));
			setSelectedOccurrence(apiOccurrenceToCard(result.occurrence));
		} catch (err: any) {
			Toast.show({
				type: "error",
				text1: "Não foi possível apoiar",
				text2: err?.friendlyMessage || err?.message,
			});
		}
	}

	const handleCommentCountChange = useCallback((itemId: string, count: number) => {
		setSelectedOccurrence((currentOccurrence) =>
			currentOccurrence?.id === itemId && currentOccurrence.comments !== count
				? { ...currentOccurrence, comments: count }
				: currentOccurrence,
		);
	}, []);

	const handleOccurrenceChange = useCallback((updatedOccurrence: Ocorrencia) => {
		setSelectedOccurrence((currentOccurrence) =>
			currentOccurrence?.id === updatedOccurrence.id ? updatedOccurrence : currentOccurrence,
		);

		if (userLocation) {
			void loadRanking(false, userLocation);
		}
	}, [loadRanking, userLocation]);

	if (selectedOccurrence) {
		return (
			<View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
				<OccurrenceDetails
					occurrence={selectedOccurrence}
					isSupported={selectedOccurrence.supportedByMe}
					onBack={() => setSelectedOccurrence(null)}
					onPressSupport={() => {
						void handleToggleSelectedSupport();
					}}
					onCommentCountChange={handleCommentCountChange}
					onOccurrenceChange={handleOccurrenceChange}
				/>
				<StatusBar style="auto" />
				<Toast position="top" bottomOffset={20} />
			</View>
		);
	}

	return (
		<View style={{ flex: 1, backgroundColor: globalStyles.container.backgroundColor }}>
			<Stack.Screen options={{ headerShown: false }} />
			<Header title="Ranking" showBack onBack={() => router.back()} />

			<ScrollView
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={async () => {
							setRefreshing(true);
							const nextLocation = await loadLocation();
							await loadRanking(false, nextLocation);
						}}
					/>
				}
			>
				<View style={styles.periodSelector}>
					{PERIODS.map((period) => {
						const active = selectedPeriod === period;

						return (
							<TouchableOpacity
								key={period}
								style={[styles.periodButton, active && styles.periodButtonActive]}
								onPress={() => setSelectedPeriod(period)}
							>
								<Text style={[styles.periodText, active && styles.periodTextActive]}>
									{formatPeriodLabel(period)}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				<View style={styles.rangeInfo}>
					<Ionicons name={userLocation ? "location-outline" : "globe-outline"} size={18} color={colors.textSecondary} />
					<Text style={styles.rangeText}>{locationDescription}</Text>
				</View>

				{loading ? (
					<View style={styles.loadingBox}>
						<ActivityIndicator color={colors.primary} />
						<Text style={styles.loadingText}>Carregando indicadores...</Text>
					</View>
				) : (
					<>
            <View style={styles.statsGrid}>
              <StatCard icon="document-text-outline" label="Denúncias criadas" value={ranking.summary.created} />
              <StatCard icon="checkmark-circle-outline" label="Resolvidas" value={ranking.summary.resolved} />
              {/* <StatCard icon="pricetag-outline" label="Categoria mais reportada" value={ranking.summary.topCategory} /> */}
            </View>

						<SectionTitle title="Top Maiores Categorias" />
						<CategoryChart data={ranking.categoryRanking} />

						<SectionTitle title="Top Publicações com Apoio" />
						<View style={styles.listCard}>
							{ranking.topOccurrences.length === 0 ? (
								<EmptyState message="Nenhuma denúncia encontrada no período." />
							) : (
								ranking.topOccurrences.slice(0, 10).map((occurrence, index) => (
									<TouchableOpacity
										key={occurrence.id}
										style={styles.listRow}
										activeOpacity={0.86}
										disabled={openingOccurrenceId === occurrence.id}
										onPress={() => {
											void handleOpenOccurrenceDetails(occurrence.id);
										}}
									>
										<View style={styles.rankBadge}>
											<Text style={styles.rankBadgeText}>{index + 1}</Text>
										</View>
										<View style={styles.listContent}>
											<Text style={styles.listTitle} numberOfLines={1}>
												{occurrence.title}
											</Text>
											<Text style={styles.listSubtitle} numberOfLines={1}>
												{occurrence.category} - {statusLabels[occurrence.status]}
											</Text>
										</View>
										<View style={styles.metricPill}>
											{openingOccurrenceId === occurrence.id ? (
												<ActivityIndicator size="small" color={colors.primary} />
											) : (
												<>
													<Ionicons name="thumbs-up" size={14} color={colors.primary} />
													<Text style={styles.metricText}>{occurrence.supportCount}</Text>
												</>
											)}
										</View>
									</TouchableOpacity>
								))
							)}
						</View>

						<SectionTitle title="Usuários Destaque do período" />
						<View style={styles.listCard}>
							{ranking.featuredUsers.length === 0 ? (
								<EmptyState message="Nenhum usuário em destaque no período." />
							) : (
								ranking.featuredUsers.slice(0, 10).map((user, index) => (
									<View key={user.userId} style={styles.listRow}>
										<View style={styles.avatar}>
											<Text style={styles.avatarText}>
												{user.name.trim().charAt(0).toUpperCase() || "U"}
											</Text>
										</View>
										<View style={styles.listContent}>
											<Text style={styles.listTitle} numberOfLines={1}>
												{index + 1}. {user.name}
											</Text>
											<Text style={styles.listSubtitle} numberOfLines={1}>
												{user.created} denúncias - {user.supports} apoios - {user.resolved} resolvidas
											</Text>
										</View>
										<Text style={styles.scoreText}>{user.score} pts</Text>
									</View>
								))
							)}
						</View>
					</>
				)}
			</ScrollView>

			<StatusBar style="auto" />
			<Toast position="top" bottomOffset={20} />
		</View>
	);
}

const styles = StyleSheet.create({
	content: {
		padding: spacing.md,
		paddingBottom: 100,
	},
	periodSelector: {
		flexDirection: "row",
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	periodButton: {
		flex: 1,
		minHeight: 42,
		borderRadius: radii.pill,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: spacing.sm,
	},
	periodButtonActive: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	periodText: {
		color: colors.textSecondary,
		fontSize: 13,
		fontWeight: "600",
		textAlign: "center",
	},
	periodTextActive: {
		color: colors.surface,
	},
	rangeInfo: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	rangeText: {
		flex: 1,
		color: colors.textSecondary,
		fontSize: 14,
		lineHeight: 20,
	},
	loadingBox: {
		minHeight: 320,
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
	},
	loadingText: {
		color: colors.textSecondary,
	},
	statsGrid: {
		flexDirection: "row",
		gap: spacing.sm,
		marginBottom: spacing.md,
	},
	statCard: {
		width: "49%",
		minHeight: 118,
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		alignItems: "center",
		justifyContent: "center",
	},
	statIcon: {
		width: 34,
		height: 34,
		borderRadius: radii.pill,
		backgroundColor: colors.secondary,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.sm,
	},
	statValue: {
		color: colors.text,
		fontSize: 20,
		fontWeight: "700",
		marginBottom: spacing.xs,
		textAlign: "center",
	},
	statLabel: {
		color: colors.textSecondary,
		fontSize: 13,
		lineHeight: 18,
		textAlign: "center",
	},
	sectionTitle: {
		color: colors.text,
		fontSize: 18,
		fontWeight: "700",
		marginTop: spacing.lg,
		marginBottom: spacing.sm,
	},
	chartCard: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
	},
	horizontalChartCard: {
		position: "relative",
		overflow: "hidden",
	},
	categoryChart: {
		width: "100%",
		minHeight: 210,
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		gap: spacing.sm,
		position: "relative",
	},
	categoryChartScrollable: {
		width: 620,
	},
	categoryChartStaticWrapper: {
		flexGrow: 1,
	},
	chartGuides: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 24,
		height: 132,
		justifyContent: "space-between",
	},
	chartGuideLine: {
		height: 1,
		backgroundColor: colors.border,
		opacity: 0.75,
	},
	categoryBarItem: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-end",
		zIndex: 1,
	},
	barValue: {
		color: colors.textSecondary,
		fontSize: 12,
		fontWeight: "700",
		marginBottom: spacing.xs,
	},
	categoryBar: {
		width: 24,
		borderTopLeftRadius: radii.pill,
		borderTopRightRadius: radii.pill,
		backgroundColor: colors.primary,
		opacity: 0.82,
	},
	barLabel: {
		color: colors.textSecondary,
		fontSize: 11,
		lineHeight: 14,
		textAlign: "center",
		marginTop: spacing.sm,
		minHeight: 30,
	},
	listCard: {
		backgroundColor: colors.surface,
		borderRadius: radii.lg,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: spacing.md,
	},
	listRow: {
		minHeight: 70,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	listContent: {
		flex: 1,
	},
	listTitle: {
		color: colors.text,
		fontSize: 15,
		fontWeight: "700",
		marginBottom: spacing.xs,
	},
	listSubtitle: {
		color: colors.textSecondary,
		fontSize: 12,
	},
	rankBadge: {
		width: 30,
		height: 30,
		borderRadius: radii.pill,
		backgroundColor: colors.secondary,
		alignItems: "center",
		justifyContent: "center",
	},
	rankBadgeText: {
		color: colors.primary,
		fontSize: 13,
		fontWeight: "700",
	},
	metricPill: {
		minWidth: 48,
		height: 30,
		borderRadius: radii.pill,
		backgroundColor: colors.secondary,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.xs,
		paddingHorizontal: spacing.sm,
	},
	metricText: {
		color: colors.primary,
		fontSize: 13,
		fontWeight: "700",
	},
	userBarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.md,
		zIndex: 1,
	},
	userBarContent: {
		flex: 1,
	},
	userBarHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: spacing.xs,
		gap: spacing.sm,
	},
	userBarName: {
		flex: 1,
		color: colors.text,
		fontSize: 14,
		fontWeight: "700",
	},
	userBarScore: {
		color: colors.textSecondary,
		fontSize: 12,
		fontWeight: "700",
	},
	horizontalTrack: {
		height: 10,
		borderRadius: radii.pill,
		backgroundColor: colors.secondary,
		overflow: "hidden",
	},
	horizontalBar: {
		height: "100%",
		borderRadius: radii.pill,
		backgroundColor: colors.primary,
	},
	horizontalGuides: {
		position: "absolute",
		left: spacing.md + 30 + spacing.sm,
		right: spacing.md,
		top: spacing.md,
		bottom: spacing.md,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	horizontalGuideLine: {
		width: 1,
		backgroundColor: colors.border,
		opacity: 0.75,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: radii.pill,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		color: colors.surface,
		fontSize: 16,
		fontWeight: "700",
	},
	scoreText: {
		color: colors.primary,
		fontSize: 13,
		fontWeight: "700",
	},
	emptyState: {
		minHeight: 112,
		alignItems: "center",
		justifyContent: "center",
		gap: spacing.sm,
		padding: spacing.md,
	},
	emptyText: {
		color: colors.textSecondary,
		fontSize: 14,
		textAlign: "center",
		lineHeight: 20,
	},
});
