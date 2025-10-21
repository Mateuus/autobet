// Configuração para suprimir avisos de hidratação específicos
// Este arquivo deve ser importado no início da aplicação

if (typeof window !== 'undefined') {
  // Suprimir avisos de hidratação específicos causados por extensões do navegador
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    
    // Suprimir avisos específicos de hidratação
    if (
      typeof message === 'string' && 
      (message.includes('hydration') || 
       message.includes('server rendered HTML') ||
       message.includes('client properties'))
    ) {
      return;
    }
    
    // Permitir outros erros
    originalError.apply(console, args);
  };
}

// Configuração adicional para React
if (typeof window !== 'undefined') {
  // Suprimir avisos de hidratação do React
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0];
    
    if (
      typeof message === 'string' && 
      message.includes('hydration')
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}
