
// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/carboidratos',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(alimento, medidausu, medida, cho, cal) {
            let ajax_options = {
                type: 'POST',
                url: 'api/carboidratos',
                accepts: 'application/json',
                contentType: 'application/json',
                //dataType: 'json',
                data: JSON.stringify({
                    'alimento': alimento,
                    'medidausu': medidausu,
					'medida': parseInt(medida),
					'cho': parseInt(cho),
					'cal': parseInt(cal)				
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(alimento, medidausu, medida, cho, cal) {
            let ajax_options = {
                type: 'PUT',
                url: 'api/carboidratos/' + alimento,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    'alimento': alimento,
                    'medidausu': medidausu,
					'medida': parseInt(medida),
					'cho': parseInt(cho),
					'cal': parseInt(cal)		
                })
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(alimento) {
            let ajax_options = {
                type: 'DELETE',
                url: 'api/carboidratos/' + alimento,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $alimento = $('#alimento'),
        $medidausu = $('#medidausu'),
		$medida = $('#medida'),
		$cho = $('#cho'),
		$cal = $('#cal');

    // return the API
    return {
        reset: function() {
            $alimento.val('').focus();
			$medidausu.val('');
			$medida.val(0);
		    $cho.val(0);
		    $cal.val(0);	
        },
        update_editor: function(alimento, medidausu, medida, cho, cal) {
			$alimento.val(alimento).focus();
            $medidausu.val(medidausu);
            $medida.val(medida);
		    $cho.val(cho);
		    $cal.val(cal);
        },
        build_table: function(carbo) {
            let rows = ''

            // clear the table
            $('.conteudo table > tbody').empty();

            // did we get a carbo array?
            if (carbo) {
                for (let i=0, l=carbo.length; i < l; i++) {
                    rows += `<tr><td class="alimento">${carbo[i].alimento}</td><td class="medidausu">${carbo[i].medidausu}</td><td class="medida">${carbo[i].medida}</td><td class="cho">${carbo[i].cho}</td><td class="cal">${carbo[i].cal}</td><td>${carbo[i].timestamp}</td></tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $alimento = $('#alimento'),
        $medidausu = $('#medidausu'),
		$medida = $('#medida'),
		$cho = $('#cho'),
		$cal = $('#cal');	

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(alimento, medidausu, medida, cho, cal) {
        return alimento !== "" && medidausu !== "" && medida !== 0 && cal !== 0;
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let alimento = $alimento.val(),
            medidausu = $medidausu.val(),
			medida = $medida.val(),
			cho = $cho.val(),
			cal = $cal.val();	

        e.preventDefault();

        if (validate(alimento, medidausu, medida, cho, cal)) {
            model.create(alimento, medidausu, medida, cho, cal)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
    });

    $('#update').click(function(e) {
        let alimento = $alimento.val(),
            medidausu = $medidausu.val(),
			medida = $medida.val(),
			cho = $cho.val(),
			cal = $cal.val();
			
        e.preventDefault();

        if (validate(alimento, medidausu, medida, cho, cal)) {
            model.update(alimento, medidausu, medida, cho, cal)
        } else {
            alert('Problema com os parâmetros: valores não informados');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let alimento = $alimento.val();

        e.preventDefault();

        if (validate('placeholder', alimento)) {
            model.delete(alimento)
        } else {
            alert('Problema com os parâmetros: alimento');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        //location.reload();
        //model.read();
        window.location.reload();
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            alimento,
            medidausu,
			medida,
			cho,
			cal;

        alimento = $target
            .parent()
            .find('td.alimento')
            .text();
		
		medidausu = $target
            .parent()
            .find('td.medidausu')
            .text();

        medida = $target
            .parent()
            .find('td.medida')
            .text();
		
		cho = $target
            .parent()
            .find('td.cho')
            .text();
			
		cal = $target
            .parent()
            .find('td.cal')
            .text();
		
        view.update_editor(alimento, medidausu, medida, cho, cal);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });


    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = "Msg de Erro:" + textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));