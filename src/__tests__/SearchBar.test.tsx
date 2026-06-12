import React from 'react';
import { TextInput } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  it('renders the default placeholder and forwards text changes', () => {
    const onChangeText = jest.fn();
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<SearchBar value="rua" onChangeText={onChangeText} />);
    });

    const input = renderer!.root.findByType(TextInput);

    expect(input.props.placeholder).toBe('Buscar solicitações...');
    expect(input.props.value).toBe('rua');

    act(() => {
      input.props.onChangeText('iluminação');
    });

    expect(onChangeText).toHaveBeenCalledWith('iluminação');
  });

  it('allows a custom placeholder', () => {
    let renderer: TestRenderer.ReactTestRenderer;

    act(() => {
      renderer = TestRenderer.create(<SearchBar placeholder="Buscar bairros" />);
    });

    expect(renderer!.root.findByType(TextInput).props.placeholder).toBe('Buscar bairros');
  });
});
