document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('evalForm');
    const radiosModalidade = document.querySelectorAll('input[name="modalidade"]');
    const blockMediadores = document.getElementById('blockMediadores');
    const rowPrintMediadores = document.getElementById('rowPrintMediadores');
    const btnGenerate = document.getElementById('btnGenerate');

    // Alternância de formulário (Autoavaliação vs Chefia)
    function updateModalidadeUI() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';
        if (isAuto) {
            blockMediadores.style.display = 'block';
            rowPrintMediadores.style.display = 'table-row';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 4.25)';
        } else {
            blockMediadores.style.display = 'none';
            rowPrintMediadores.style.display = 'none';
            document.getElementById('lblScoreMax').innerText = '(Máximo: 5.75)';
        }
        calculateScores();
    }

    radiosModalidade.forEach(radio => radio.addEventListener('change', updateModalidadeUI));

    // Cálculo das Médias e Pesos Oficiais da Resolução 48/2022
    function getAverage(className) {
        const inputs = Array.from(document.querySelectorAll(`.${className}`));
        const validInputs = inputs.filter(i => i.value !== '' && !isNaN(parseFloat(i.value)));
        if (validInputs.length === 0) return 0;
        const sum = validInputs.reduce((acc, curr) => acc + parseFloat(curr.value), 0);
        return sum / validInputs.length;
    }

    function calculateScores() {
        const isAuto = document.querySelector('input[name="modalidade"]:checked').value === 'auto';

        const avgConhecimentos = getAverage('input-conhecimentos');
        const avgHabilidades = getAverage('input-habilidades');
        const avgMetas = getAverage('input-metas');
        const avgComportamentos = getAverage('input-comportamentos');

        // Aplicando os fatores de peso
        const factorConhecimentos = isAuto ? 0.10 : 0.15;
        const factorHabilidades = isAuto ? 0.10 : 0.15;
        const factorMetas = isAuto ? 0.10 : 0.15;
        const factorComportamentos = 0.125; // 50% de 2.5 pts em ambas as modalidades

        const pondConhecimentos = avgConhecimentos * factorConhecimentos;
        const pondHabilidades = avgHabilidades * factorHabilidades;
        const pondMetas = avgMetas * factorMetas;
        const pondComportamentos = avgComportamentos * factorComportamentos;

        const totalPonderado = pondConhecimentos + pondHabilidades + pondMetas + pondComportamentos;

        // Atualização da UI
        document.getElementById('lblScoreConhecimentos').innerText = `${pondConhecimentos.toFixed(2)} pts (Média: ${avgConhecimentos.toFixed(1)})`;
        document.getElementById('lblScoreHabilidades').innerText = `${pondHabilidades.toFixed(2)} pts (Média: ${avgHabilidades.toFixed(1)})`;
        document.getElementById('lblScoreMetas').innerText = `${pondMetas.toFixed(2)} pts (Média: ${avgMetas.toFixed(1)})`;
        document.getElementById('lblScoreComportamentos').innerText = `${pondComportamentos.toFixed(2)} pts (Média: ${avgComportamentos.toFixed(1)})`;
        document.getElementById('lblScoreTotal').innerText = totalPonderado.toFixed(2);

        return {
            isAuto, avgConhecimentos, avgHabilidades, avgMetas, avgComportamentos,
            pondConhecimentos, pondHabilidades, pondMetas, pondComportamentos, totalPonderado
        };
    }

    // Escuta mudanças nos inputs de pontuação
    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', calculateScores);
    });

    // Impressão / PDF
    btnGenerate.addEventListener('click', () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const scores = calculateScores();

        // Dados no PDF
        document.getElementById('pModalidadeBadge').innerText = scores.isAuto ? 'AUTOAVALIAÇÃO' : 'AVALIAÇÃO DA CHEFIA IMEDIATA';
        document.getElementById('pNomeServidor').innerText = document.getElementById('nomeServidor').value;
        document.getElementById('pSiape').innerText = document.getElementById('siape').value;
        document.getElementById('pCargoServidor').innerText = document.getElementById('cargoServidor').value;
        document.getElementById('pPeriodo').innerText = document.getElementById('periodoAvaliacao').value;
        document.getElementById('pOrgaoDestino').innerText = document.getElementById('orgaoDestino').value;
        document.getElementById('pNomeChefia').innerText = document.getElementById('nomeChefia').value;
        document.getElementById('pCargoChefia').innerText = document.getElementById('cargoChefia').value;

        // Tabela no PDF
        document.getElementById('pMediaConhecimentos').innerText = scores.avgConhecimentos.toFixed(1);
        document.getElementById('pPondConhecimentos').innerText = scores.pondConhecimentos.toFixed(2);

        document.getElementById('pMediaHabilidades').innerText = scores.avgHabilidades.toFixed(1);
        document.getElementById('pPondHabilidades').innerText = scores.pondHabilidades.toFixed(2);

        document.getElementById('pMediaMetas').innerText = scores.avgMetas.toFixed(1);
        document.getElementById('pPondMetas').innerText = scores.pondMetas.toFixed(2);

        document.getElementById('pMediaComportamentos').innerText = scores.avgComportamentos.toFixed(1);
        document.getElementById('pPondComportamentos').innerText = scores.pondComportamentos.toFixed(2);

        if (scores.isAuto) {
            document.getElementById('pMediaMediadores').innerText = getAverage('input-mediadores').toFixed(1);
        }

        document.getElementById('pTotalObtido').innerText = `${scores.totalPonderado.toFixed(2)} / ${scores.isAuto ? '4.25' : '5.75'}`;
        document.getElementById('pObservacoes').innerText = document.getElementById('observacoes').value || 'Sem observações.';

        document.getElementById('pSigServidor').innerText = document.getElementById('nomeServidor').value || 'Assinatura do Servidor';
        document.getElementById('pSigChefia').innerText = document.getElementById('nomeChefia').value || 'Assinatura da Chefia';

        window.print();
    });

    updateModalidadeUI();
});
