const key = 'julianaBookings_' + new Date().toISOString().slice(0, 10);
const slots = [
	{ start: '08:00', end: '09:00' },
	{ start: '09:00', end: '10:00' },
	{ start: '10:00', end: '11:00' },
	{ start: '14:00', end: '15:00' },
	{ start: '15:00', end: '16:00' },
	{ start: '16:00', end: '17:00' },
	{ start: '17:00', end: '18:00' }
];
const slotCapacity = 3;
const whatsappNumber = '5599985339175';
let selected = null;
const $ = (id) => document.getElementById(id);

$('today').textContent = new Intl.DateTimeFormat('pt-BR', {
	weekday: 'long',
	day: '2-digit',
	month: 'long'
}).format(new Date());

function data() {
	return JSON.parse(localStorage.getItem(key) || '[]');
}

function render() {
	const appointments = data();
	const box = $('times');
	box.innerHTML = '';

	slots.forEach((slot) => {
		const label = `${slot.start}–${slot.end}`;
		const bookingsForSlot = appointments.filter((appointment) =>
			appointment.slot === slot.start || appointment.time === slot.start || appointment.time === label
		).length;
		const button = document.createElement('button');
		button.className = 'time';
		button.textContent = label;

		if (bookingsForSlot >= slotCapacity) {
			button.disabled = true;
			button.classList.add('busy');
			button.setAttribute('aria-label', `${label}, horário lotado`);
		} else {
			button.addEventListener('click', () => {
				document.querySelectorAll('.time').forEach((item) => item.classList.remove('selected'));
				button.classList.add('selected');
				selected = { ...slot, label };
			});
		}

		box.appendChild(button);
	});
}

render();

document.querySelectorAll('[data-service]').forEach((button) => {
	button.addEventListener('click', () => {
		$('service').value = button.dataset.service;
		history.replaceState(null, '', '#agendar');
		const bookingSection = $('agendar');
		const headerHeight = document.querySelector('header').getBoundingClientRect().height;
		const bookingTop = bookingSection.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
		window.scrollTo({ top: bookingTop, behavior: 'smooth' });
	});
});

$('confirm').addEventListener('click', () => {
	if (!selected) {
		$('status').textContent = 'Escolha um horário.';
		return;
	}

	const name = $('name').value.trim();
	const phone = $('phone').value.trim();

	if (!name || !phone) {
		$('status').textContent = 'Informe nome e WhatsApp.';
		return;
	}

	const appointments = data();
	const bookingsForSlot = appointments.filter((appointment) =>
		appointment.slot === selected.start || appointment.time === selected.start || appointment.time === selected.label
	).length;
	if (bookingsForSlot >= slotCapacity) {
		$('status').textContent = 'Esse horário acabou de lotar. Escolha outro.';
		selected = null;
		render();
		return;
	}

	const appointment = {
		name,
		phone,
		service: $('service').value,
		time: selected.label,
		slot: selected.start
	};
	appointments.push(appointment);
	localStorage.setItem(key, JSON.stringify(appointments));

	const message = [
		'Olá! Gostaria de confirmar um agendamento na Juliana Design.',
		`Nome: ${appointment.name}`,
		`Serviço: ${appointment.service}`,
		`Horário: ${appointment.time}`,
		`Meu WhatsApp: ${appointment.phone}`
	].join('\n');

	window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
	$('status').textContent = 'Pedido pronto no WhatsApp. Envie a mensagem para concluir o agendamento.';
	selected = null;
	render();
});