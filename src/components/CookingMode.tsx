import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { Button, Card, colors, Muted, space } from './ui';

// One step at a time, in large type, so it's easy to follow at the stove.
export function CookingMode({ steps, onDone, onExit }: { steps: string[]; onDone: () => void; onExit: () => void }) {
  const [i, setI] = useState(0);
  const last = i === steps.length - 1;
  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: space(4) }}>
        {steps.map((_, j) => (
          <View key={j} style={{ flex: 1, height: 4, marginRight: 3, borderRadius: 2, backgroundColor: j <= i ? colors.brand : colors.line }} />
        ))}
      </View>
      <Muted>{`Step ${i + 1} of ${steps.length}`}</Muted>
      <Card style={{ minHeight: 180, justifyContent: 'center', marginTop: space(2) }}>
        <Text style={{ fontSize: 22, lineHeight: 32, color: colors.ink }}>{steps[i]}</Text>
      </Card>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Back" variant="secondary" disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1, marginRight: space(2) }} />
        <Button title={last ? 'Done cooking' : 'Next step'} onPress={() => (last ? onDone() : setI(i + 1))} style={{ flex: 2 }} />
      </View>
      <Button title="Exit cooking mode" variant="ghost" onPress={onExit} style={{ marginTop: space(2) }} />
    </View>
  );
}
