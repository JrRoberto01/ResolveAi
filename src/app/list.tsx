import React from 'react';
import { FlatList, View } from 'react-native';
import { CardOcorrencia } from '../components/CardOcorrencia';
import { spacing } from '../theme/spacing';

export default function ListItem({ listItems, onLike, onEdit }: any) {
    return (
        <View style={{ flex: 1, width: '100%' }}>
            <FlatList
                data={listItems}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <CardOcorrencia 
                        data={item} 
                        onPressSupport={() => onLike(item.id)} 
                        onPressEdit={() => onEdit(item)}
                    />
                )}
            />
        </View>
    );
}