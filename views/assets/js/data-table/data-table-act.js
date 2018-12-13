(function ($) {
 "use strict";
	
	$(document).ready(function() {
		 $('#data-table-basic').DataTable({
            "language": {
                
					"sEmptyTable": "Nenhum projeto encontrado",
					"sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ projetos",
					"sInfoEmpty": "Mostrando 0 até 0 de 0 projetos",
					"sInfoFiltered": "(Filtrados de _MAX_ projetos)",
					"sInfoPostFix": "",
					"sInfoThousands": ".",
					"sLengthMenu": "_MENU_ resultados por página",
					"sLoadingRecords": "Carregando...",
					"sProcessing": "Processando...",
					"sZeroRecords": "Nenhum projeto encontrado",
					"sSearch": "Pesquisar",
					"oPaginate": {
						"sNext": "Próximo",
						"sPrevious": "Anterior",
						"sFirst": "Primeiro",
						"sLast": "Último"
					}
				
            }
        });
	});
 
})(jQuery); 