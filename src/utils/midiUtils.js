export async function getMIDIOutput() {
    try {
      const access = await navigator.requestMIDIAccess();
      const outputs = [...access.outputs.values()];
      return outputs.length > 0 ? outputs[0] : null;
    } catch {
      return null;
    }
  }
  