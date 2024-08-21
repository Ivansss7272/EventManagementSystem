@app.route('/events/bulk', methods=['POST'])
@token_required
def create_multiple_events(current_user):
    events_data = request.get_json().get('events', [])  

    events = []

    organizer_id = current_user.id

    for event_data in events_data:
        event = Event(
            title=event_data['title'],
            description=event_data.get('description', ""),
            date=datetime.strptime(event_data['date'], '%Y-%m-%d'),
            organizer_id=organizer_id
        )
        events.append(event)  

    db.session.add_all(events)
    db.session.commit()

    return jsonify({'message': f'{len(events)} events created successfully'}), 201
